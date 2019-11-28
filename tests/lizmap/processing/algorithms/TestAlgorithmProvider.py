""" Test processing Provider
"""

import traceback

from qgis.core import (QgsApplication,
                       QgsProcessingProvider)

from .TestSimpleValue import TestSimpleValue
from .TestCopyLayer import TestCopyLayer
from .TestFileDestination import TestFileDestination

class TestAlgorithmProvider(QgsProcessingProvider):

    def __init__(self):
        super().__init__()

    def getAlgs(self):
        try:
            algs = [
                 TestSimpleValue(),
                 TestCopyLayer(),
                 TestFileDestination(),
            ]
        except:
            traceback.print_exc()
            algs = []
        return algs
    
    def id(self):
        return 'pyqgiswps_test'

    def name(self):
        return "PyQgisWPS Test"

    def loadAlgorithms(self):
        self.algs = self.getAlgs()
        for a in self.algs:
            self.addAlgorithm(a)

class DummyAlgorithmProvider(QgsProcessingProvider):

    def __init__(self):
        super().__init__()
    
    def id(self):
        return 'pyqgiswps_dummy_test'

    def name(self):
        return "QyWPS Dummy Test"

    def loadAlgorithms(self):
        pass

