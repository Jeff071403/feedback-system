from django.db import models

class Feedback(models.Model):
    problems = models.JSONField(default=list)
    frequency = models.CharField(max_length=50)
    affected = models.CharField(max_length=50)
    digital_tool_help = models.CharField(max_length=50)
    digital_tool_types = models.JSONField(default=list)
    user_group = models.CharField(max_length=50)
    description = models.TextField()
    priority = models.CharField(max_length=20, default='Low')
    status = models.CharField(max_length=20, default='Pending')
    timestamp = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100, default='Anonymous')
    department = models.CharField(max_length=100, default='N/A')

    # Linked Digital Solution fields
    solution_name = models.CharField(max_length=255, null=True, blank=True)
    solution_type = models.CharField(max_length=50, null=True, blank=True)
    solution_status = models.CharField(max_length=50, null=True, blank=True)
    solution_description = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Feedback {self.id} - {self.priority} - {self.status}"
