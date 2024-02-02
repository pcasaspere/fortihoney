package actions

import (
	"net/http"

	"github.com/gobuffalo/buffalo"
)

func HomeRedirectToLoginHandler(c buffalo.Context) error {
	return c.Redirect(http.StatusSeeOther, "loginViewPath()")
}
