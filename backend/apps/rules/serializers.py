from rest_framework import serializers

class RuleCheckInputSerializer(serializers.Serializer):
    """
    Serializer to validate the input for the business rule check.
    """
    student_profile = serializers.JSONField()
    procedure_id = serializers.CharField(max_length=100)

    def validate_procedure_id(self, value):
        # TODO: Add validation to ensure procedure_id is valid
        return value

class RuleCheckOutputSerializer(serializers.Serializer):
    """
    Serializer for the output of the business rule check.
    """
    result = serializers.ChoiceField(choices=["PASS", "FAIL"])
    details = serializers.DictField(child=serializers.CharField(), required=False)