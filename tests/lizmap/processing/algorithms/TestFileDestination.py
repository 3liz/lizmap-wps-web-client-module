""" Test file destination parsing
"""
import codecs

from qgis.core import (QgsProcessingParameterNumber,
                       QgsProcessingParameterString,
                       QgsProcessingOutputNumber,
                       QgsProcessingOutputString,
                       QgsProcessingParameterFileDestination,
                       QgsProcessingAlgorithm)


class TestFileDestination(QgsProcessingAlgorithm):

    OUTPUT = 'OUTPUT'

    def __init__(self):
        super().__init__()

    def name(self):
        return 'testfiledestination'

    def displayName(self):
        return 'Test input file destination'

    def createInstance(self, config={}):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        return self.__class__()

    def initAlgorithm( self, config=None ):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        self.addParameter(QgsProcessingParameterFileDestination(self.OUTPUT,
            'Text file',
            'TEXT Files (*.txt)'
        ))

    def processAlgorithm(self, parameters, context, feedback):

        outputTxtFile = self.parameterAsFileOutput(parameters, self.OUTPUT, context)

        # Prepare results
        results = {
            self.OUTPUT: None
        }

        with codecs.open(outputTxtFile, 'w', encoding='utf-8') as f:
            f.write('Test input file destination result!')
            results[self.OUTPUT] = outputTxtFile

        return results
