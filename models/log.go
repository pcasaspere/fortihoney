package models

import (
	"encoding/json"
	"time"

	"github.com/gobuffalo/pop/v6"
	"github.com/gobuffalo/validate/v3"
	"github.com/gofrs/uuid"
)

type Log struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	Password     string    `json:"password" db:"password"`
	IPv4         string    `json:"ipv4" db:"ipv4"`
	IPv6         string    `json:"ipv6" db:"ipv6"`
	Country      string    `json:"country" db:"country"`
	AS           string    `json:"as" db:"as"`
	BrowserAgent string    `json:"browser-agent" db:"browser_agent"`
	Count        int32     `json:"count" db:"count"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// String is not required by pop and may be deleted
func (l Log) String() string {
	jl, _ := json.Marshal(l)
	return string(jl)
}

// Logs is not required by pop and may be deleted
type Logs []Log

// String is not required by pop and may be deleted
func (l Logs) String() string {
	jl, _ := json.Marshal(l)
	return string(jl)
}

// Validate gets run every time you call a "pop.Validate*" (pop.ValidateAndSave, pop.ValidateAndCreate, pop.ValidateAndUpdate) method.
// This method is not required and may be deleted.
func (l *Log) Validate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.NewErrors(), nil
}

// ValidateCreate gets run every time you call "pop.ValidateAndCreate" method.
// This method is not required and may be deleted.
func (l *Log) ValidateCreate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.NewErrors(), nil
}

// ValidateUpdate gets run every time you call "pop.ValidateAndUpdate" method.
// This method is not required and may be deleted.
func (l *Log) ValidateUpdate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.NewErrors(), nil
}
