from sqlalchemy import Column, Integer, String, DECIMAL, Date
from ..database import Base


class ShanghaiEvent(Base):
    """历史事件表 (SHANGHAI_EVENT)"""
    __tablename__ = "SHANGHAI_EVENT"

    EVENT_ID = Column(Integer, primary_key=True)
    REIGN_TITLE = Column(String(20))
    EVENT_YEAR = Column(String(4))
    EVENT_DATE = Column(String(50))
    SHOW_DATE = Column(Date)
    EVENT_DESCRIPTION = Column(String(1000))
    EVENT_NAME = Column(String(100))
    EVENT_IMPORTANCE = Column(String(2))
    EVENT_CATEGORY = Column(String(10))
    EVENT_SUB_CATEGORY = Column(String(10))


class Population(Base):
    """人口数据表 (POPULATION)"""
    __tablename__ = "POPULATION"

    YEAR = Column(String(4), primary_key=True)
    LOCATION = Column(String(1), primary_key=True)
    PEOPLE_COUNT = Column(Integer)


class LandValuation(Base):
    """土地估值表 (LAND_VALUATION)"""
    __tablename__ = "LAND_VALUATION"

    ID = Column(Integer, primary_key=True)
    YEAR = Column(String(4))
    LOCATION = Column(String(1))
    LAND_VALUATION = Column(Integer)
    STATISTICS_GROUP = Column(String(100))


class ShanghaiTradeProportion(Base):
    """贸易占比表 (SHANGHAI_TRADE_PROPORTION_IN_TOTAL)"""
    __tablename__ = "SHANGHAI_TRADE_PROPORTION_IN_TOTAL"

    ID = Column(Integer, primary_key=True)
    YEAR = Column(String(4))
    IMPORTS_OF_FOREIGN_GOODS_TOTAL = Column(Integer)
    IMPORTS_OF_FOREIGN_GOODS_SHANGHAI = Column(Integer)
    NATIONAL_EXPORTS_TOTAL = Column(Integer)
    NATIONAL_EXPORTS_SHANGHAI = Column(Integer)
    FOREIGN_TRADE_TOTAL = Column(Integer)
    FOREIGN_TRADE_SHANGHAI = Column(Integer)
    MONETARY_UNIT = Column(String(10))
