""" Test getting point
"""

from qgis.core import (QgsProcessingParameterPoint,
                       QgsProcessingOutputString,
                       QgsProcessingAlgorithm)


class TestPoint(QgsProcessingAlgorithm):

    INPUT = 'INPUT'
    OUTPUT = 'OUTPUT'

    def __init__(self):
        super().__init__()

    def name(self):
        return 'testpoint'

    def displayName(self):
        return 'Test Point'

    def createInstance(self, config={}):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        return self.__class__()

    def initAlgorithm(self, config=None):
        """ Virtual override

           see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        self.addParameter(QgsProcessingParameterPoint(self.INPUT, 'Point'))
        self.addOutput(QgsProcessingOutputString(self.OUTPUT, "Output"))

    def processAlgorithm(self, parameters, context, feedback):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        point = self.parameterAsPoint(parameters, self.INPUT, context)
        crs = self.parameterAsPointCrs(parameters, self.INPUT, context)

        return {self.OUTPUT: point.toString(8)+' ('+crs.authid()+')'}
