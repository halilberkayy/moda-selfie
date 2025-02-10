import redis
import time
from redis.connection import ConnectionPool
from fastapi import HTTPException
from app.utils.config import get_settings
from app.utils.logger import get_logger
from app.utils.exceptions import RateLimitError
from functools import wraps

logger = get_logger(__name__)
settings = get_settings()

# Redis bağlantı havuzu
pool = ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True,
    max_connections=10
)

class RateLimiter:
    def __init__(self):
        self.redis = redis.Redis(connection_pool=pool)
        self.default_limit = settings.RATE_LIMIT_PER_MINUTE
        self.window = 60  # 1 dakika

    def check_rate_limit(self, key: str, limit: int = None) -> bool:
        """
        Rate limit kontrolü yapar.
        
        Args:
            key (str): Rate limit için kullanılacak anahtar
            limit (int, optional): Dakikadaki istek limiti
            
        Returns:
            bool: Limit aşılmadıysa True, aşıldıysa False
            
        Raises:
            RateLimitError: Redis bağlantı hatası durumunda
        """
        try:
            pipe = self.redis.pipeline()
            now = int(time.time())
            limit = limit or self.default_limit
            
            # Pencere başlangıcı
            window_start = now - self.window
            
            # Eski kayıtları temizle
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Mevcut istek sayısını al
            pipe.zcard(key)
            
            # Yeni isteği ekle
            pipe.zadd(key, {str(now): now})
            
            # Anahtarın süresini ayarla (60 saniye)
            pipe.expire(key, self.window)
            
            # Pipeline'ı çalıştır
            _, request_count, *_ = pipe.execute()
            
            # Limit kontrolü
            if request_count > limit:
                logger.warning(f"Rate limit exceeded for key: {key}")
                return False
                
            return True
            
        except redis.RedisError as e:
            logger.error(f"Redis error in rate limiter: {str(e)}")
            # Redis hatası durumunda isteğe izin ver
            return True
            
        except Exception as e:
            logger.error(f"Unexpected error in rate limiter: {str(e)}")
            return True

    def get_remaining_requests(self, key: str) -> int:
        """
        Kalan istek sayısını döndürür.
        
        Args:
            key (str): Rate limit anahtarı
            
        Returns:
            int: Kalan istek sayısı
        """
        try:
            now = int(time.time())
            window_start = now - self.window
            
            # Eski kayıtları temizle ve mevcut sayıyı al
            self.redis.zremrangebyscore(key, 0, window_start)
            current_count = self.redis.zcard(key)
            
            return max(0, self.default_limit - current_count)
            
        except Exception as e:
            logger.error(f"Error getting remaining requests: {str(e)}")
            return 0

_rate_limiter = RateLimiter()

def rate_limit(key_prefix: str = None, limit: int = None):
    """
    Rate limiting decorator.
    
    Args:
        key_prefix (str, optional): Rate limit anahtarı için önek
        limit (int, optional): İstek limiti
        
    Returns:
        function: Decorator fonksiyonu
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Request nesnesini bul
            request = None
            for arg in args:
                if hasattr(arg, "client"):
                    request = arg
                    break
            
            if not request:
                return await func(*args, **kwargs)
            
            # Rate limit anahtarını oluştur
            key = f"rate_limit:{key_prefix or func.__name__}:{request.client.host}"
            
            # Rate limit kontrolü
            if not _rate_limiter.check_rate_limit(key, limit):
                remaining = _rate_limiter.get_remaining_requests(key)
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": "Rate limit exceeded",
                        "remaining": remaining,
                        "retry_after": 60  # saniye
                    }
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
