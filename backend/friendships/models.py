from django.db import models
from django.conf import settings

class Friendship(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
    ]

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_friendships', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_friendships', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def accept(self):
        self.status = self.ACCEPTED
        self.save()

    def reject(self):
        self.status = self.REJECTED
        self.save()

    @property
    def is_pending(self):
        return self.status == self.PENDING

    class Meta:
        unique_together = ('sender', 'receiver')