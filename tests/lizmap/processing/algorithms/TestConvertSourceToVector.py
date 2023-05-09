""" Test converting QgsProcessingParameterFeatureSource to a value for
    QgsProcessingParameterVectorLayer
"""

from qgis.core import (QgsFeatureRequest,
                       QgsProcessingParameterFeatureSource,
                       QgsProcessingParameterVectorDestination,
                       QgsProcessingAlgorithm)


class TestConvertSourceToVector(QgsProcessingAlgorithm):

    INPUT = 'input'
    OUTPUT = 'native:centroids_1:OUTPUT'

    def __init__(self):
        super().__init__()

    def name(self):
        return 'convertsourcetovector'

    def displayName(self):
        return 'Convert Source To Vector'

    def createInstance(self, config={}):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        return self.__class__()

    def initAlgorithm(self, config=None):
        """ Virtual override

            see https://qgis.org/api/classQgsProcessingAlgorithm.html
        """
        self.addParameter(
            QgsProcessingParameterFeatureSource(self.INPUT, 'Input layer')
        )
        self.addParameter(
            QgsProcessingParameterVectorDestination(self.OUTPUT, "Centroides")
        )

    def processAlgorithm(self, parameters, context, feedback):
        import processing
        layer = self.parameterAsSource(parameters, self.INPUT, context)
        output = self.parameterAsOutputLayer(parameters, self.OUTPUT, context)
        params = {
            self.INPUT: layer.materialize(QgsFeatureRequest()),
            self.OUTPUT: output
        }
        result = processing.run(
            "model:centroides",
            params,
            context=context,
            feedback=feedback
        )
        return {self.OUTPUT: result[self.OUTPUT]}
