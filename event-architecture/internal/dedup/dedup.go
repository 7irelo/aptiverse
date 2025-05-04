package dedup

import (
	"sync"
	"time"

	lru "github.com/hashicorp/golang-lru/v2"
)

// Deduplicator provides in-memory event deduplication using an LRU cache with TTL.
type Deduplicator struct {
	cache *lru.Cache[string, time.Time]
	ttl   time.Duration
	mu    sync.Mutex
}

// New creates a Deduplicator with the given capacity and TTL window.
func New(size int, ttl time.Duration) (*Deduplicator, error) {
	cache, err := lru.New[string, time.Time](size)
	if err != nil {
		return nil, err
	}
	return &Deduplicator{
		cache: cache,
		ttl:   ttl,
	}, nil
}

// IsDuplicate returns true if the event_id has been seen within the TTL window.
// If not a duplicate, it records the event_id.
func (d *Deduplicator) IsDuplicate(eventID string) bool {
	d.mu.Lock()
	defer d.mu.Unlock()

	if ts, ok := d.cache.Get(eventID); ok {
		if time.Since(ts) < d.ttl {
			return true
		}
		// Expired entry — treat as new.
	}

	d.cache.Add(eventID, time.Now())
	return false
}
