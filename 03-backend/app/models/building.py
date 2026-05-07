from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime
from sqlalchemy.sql import func
from ..database import Base


class HistoricPreservationBuilding(Base):
    __tablename__ = "SHANGHAI_HISTORIC_PRESERVATION_BUILDING"

    BUILDING_ID = Column(Integer, primary_key=True)
    ORIGINAL_NAME = Column(String(100))
    CURRENT_NAME = Column(String(100))
    ADDRESS = Column(String(200))
    STRUCTURE_TYPE = Column(String(50))
    CONSTRUCTION_YEAR = Column(String(150))
    PRESERVATION_CATEGORY = Column(String(200))
    PRESERVATION_REQUIREMENTS = Column(String(500))
    IMAGE_PATH = Column(String(500))
    LATITUDE = Column(DECIMAL(20, 15))
    LONGITUDE = Column(DECIMAL(21, 15))
    BATCH = Column(String(100))


class ShanghaiHistoryBuilding(Base):
    __tablename__ = "Shanghai_history_building"

    BUILDING_ID = Column(Integer, primary_key=True)
    BUILDING_NAME = Column(String(200))
    BUILDING_CHINESE_NAME = Column(String(200))
    BUILDING_ADDRESS = Column(String(300))
    DATE_START = Column(String(20))
    DATE_END = Column(String(20))
    X_AXIS = Column(DECIMAL(15, 4))
    Y_AXIS = Column(DECIMAL(15, 4))


class ShanghaiBuildingLink(Base):
    __tablename__ = "SHANGHAI_BUILDING_LINK"
    ID = Column(Integer, primary_key=True)
    PRESERVATION_ID = Column(Integer)
    BUILDING_ID = Column(Integer)


class HistoryPhotography(Base):
    __tablename__ = "SHANGHAI_HISTORY_PHOTOGRAPHY"

    ID = Column(Integer, primary_key=True)
    ENGLISH_TITLE = Column(String(500))
    CHINESE_TITLE = Column(String(500))
    DESCRIPTION = Column(String(500))
    SOURCE = Column(String(200))
    YEAR = Column(String(100))
    TIME_PERIOD = Column(String(50))
    IMAGE_FILENAME = Column(String(200))


class BuildingPhotography(Base):
    __tablename__ = "SHANGHAI_HISTORY_BUILDING_PHOTOGRAPHY"

    ID = Column(Integer, primary_key=True)
    BUILDING_ID = Column(Integer)
    PHOTOGRAPHY_ID = Column(Integer)


class HistoryMap(Base):
    __tablename__ = "SHANGHAI_HISTORY_MAP"

    ID = Column(Integer, primary_key=True)
    FILE_NUMBER = Column(String(20))
    TITLE = Column(String(500))
    CHINESE_NAME = Column(String(500))
    FOREIGN_NAME = Column(String(500))
    YEAR = Column(String(10))
    ERA = Column(String(100))
    PINYIN = Column(String(500))
    IMAGE_FILENAME = Column(String(200))
    VIDEO_AVAILABLE = Column(String(20))
    MAP_TYPE = Column(String(100))
    SUBTYPE = Column(String(100))
    TAGS = Column(String(500))
    SERIES = Column(String(200))
    CLARITY = Column(String(50))
    IMPORTANCE = Column(String(50))
    USAGE_SUGGESTIONS = Column(String(500))
    SOURCE = Column(String(200))
