""" Test just returning simple plot
"""
import json
import codecs

from qgis.core import (
    QgsProcessingParameterNumber,
    QgsProcessingParameterFileDestination,
    QgsProcessingOutputFile,
    QgsProcessingAlgorithm,
    QgsProcessingException
)
from qgis.PyQt.QtCore import QCoreApplication


class TestPlot(QgsProcessingAlgorithm):
    """
    Create a simple plot for Plotly JS
    """
    POWER = 'POWER'
    OUTPUT_JSON_FILE = 'OUTPUT_JSON_FILE'

    def __init__(self):
        super().__init__()
        """Here we define the inputs and output of the algorithm, along
        with some other properties.
        """

    def name(self):
        return 'testplot'

    def displayName(self):
        return 'Test Plot'

    def createInstance(self, config={}):
        """ Virtual override
            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        return self.__class__()


    @staticmethod
    def tr(string, context=''):
        if context == '':
            context = 'Processing'
        return QCoreApplication.translate(context, string)


    def initAlgorithm(self, config=None):

        self.addParameter(
            QgsProcessingParameterNumber(
                self.POWER,
                'Power',
                type=QgsProcessingParameterNumber.Integer,
                defaultValue=2,
                minValue=2
            )
        )


        # Add an file to return a response in JSON format
        json_param = QgsProcessingParameterFileDestination(
            self.OUTPUT_JSON_FILE,
            self.tr('JSON file'),
            self.tr('JSON Files (*.json)')
        )
        json_param.setMetadata({
            'plotly': True
        })
        self.addParameter(json_param)

    def processAlgorithm(self, parameters, context, feedback):
        """
        :param parameters:
        :param context:
        """

        p = self.parameterAsInt(parameters, self.POWER, context)
        if p > 4:
            raise QgsProcessingException('Failed')

        outputJsonFile = self.parameterAsFileOutput(parameters, self.OUTPUT_JSON_FILE, context)

        x = range(10)
        y = [p**i for i in x]

        trace1 = {
            'x': list(x),
            'y': y,
            'type': 'scatter',
            'name': 'Power {}'.format(p)
        }
        data = [trace1]

        layout = {
            'title':'Line plot: Power {}'.format(p)
        }

        # Prepare results
        results = {
            self.OUTPUT_JSON_FILE: None
        }

        ojson = {
            'data': data,
            'layout': layout
        }
        with codecs.open(outputJsonFile, 'w', encoding='utf-8') as f:
            f.write(json.dumps(ojson))
            results[self.OUTPUT_JSON_FILE] = outputJsonFile

        return results
