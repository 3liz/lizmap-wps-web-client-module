""" Test getting bounding box
"""

from qgis.core import (QgsProcessingParameterExtent,
                       QgsProcessingOutputString,
                       QgsProcessingAlgorithm)


class TestBoundingBox(QgsProcessingAlgorithm):

    INPUT = 'INPUT'
    OUTPUT = 'OUTPUT'

    def __init__(self):
        super().__init__()

    def name(self):
        return 'testboundingbox'

    def displayName(self):
        return 'Test Bounding Box'

    def createInstance(self, config={}):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        return self.__class__()

    def initAlgorithm(self, config=None):
        """ Virtual override

           see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        self.addParameter(QgsProcessingParameterExtent(self.INPUT, 'Extent'))
        self.addOutput(QgsProcessingOutputString(self.OUTPUT, "Output"))

    def processAlgorithm(self, parameters, context, feedback):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        extent = self.parameterAsExtent(parameters, self.INPUT, context)
        crs = self.parameterAsExtentCrs(parameters, self.INPUT, context)

        return {self.OUTPUT: extent.toString(8)+' ('+crs.authid()+')'}
