import logging
import sys
from logging.handlers import RotatingFileHandler

def get_logger(name: str) -> logging.Logger:
    """
    Uygulama için özelleştirilmiş logger oluşturur.
    
    Args:
        name: Logger ismi (genellikle __name__)
        
    Returns:
        logging.Logger: Yapılandırılmış logger nesnesi
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:  # Prevent adding handlers multiple times
        logger.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
        
        # File handler
        file_handler = RotatingFileHandler(
            'app.log',
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    return logger
