package schema

import "fmt"

// KnownEventTypes is the set of valid event types the server accepts.
var KnownEventTypes = map[string]bool{
	// Assessment
	"assessment.sba_created":        true,
	"assessment.sba_goal_set":       true,
	"assessment.practice_generated": true,
	"assessment.practice_submitted": true,
	"assessment.graded":             true,

	// Student
	"student.activity_logged":    true,
	"student.strength_analysis":  true,
	"student.journey_updated":    true,
	"student.goal_created":       true,
	"student.goal_progress":      true,

	// Tutor
	"tutor.match_requested":   true,
	"tutor.session_booked":    true,
	"tutor.course_published":  true,
	"tutor.session_completed": true,

	// Payment
	"payment.initiated":            true,
	"payment.completed":            true,
	"payment.failed":               true,
	"payment.subscription_changed": true,

	// Notification
	"notification.email": true,
	"notification.push":  true,
	"notification.sms":   true,

	// Wellbeing
	"wellbeing.mood_checkin":           true,
	"wellbeing.diary_entry":            true,
	"wellbeing.psychologist_referral":  true,
	"wellbeing.stress_alert":           true,

	// Reward
	"reward.verification_requested": true,
	"reward.verified":               true,
	"reward.granted":                true,

	// Calendar
	"calendar.sync_requested":    true,
	"calendar.reminder_scheduled": true,

	// Analytics
	"analytics.ai_inference": true,
	"analytics.audit":        true,
}

// ValidateEventType checks whether an event_type is recognized.
func ValidateEventType(eventType string) error {
	if !KnownEventTypes[eventType] {
		return fmt.Errorf("unknown event_type: %s", eventType)
	}
	return nil
}
