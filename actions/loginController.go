package actions

import (
	"fmt"
	"fortihoney/models"
	"net"
	"net/http"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop"
	"github.com/oschwald/geoip2-golang"
)

type loginRequest struct {
	Ajax       string `form:"ajax" json:"ajax"`
	Username   string `form:"username" json:"username"`
	Realm      string `form:"realm" json:"realm"`
	Credential string `form:"credential" json:"credential"`
}

func createLog(log *models.Log) error {

	connect, err := pop.Connect("development")

	if err != nil {
		return err
	}

	return connect.Create(log)
}

func getRealIP(c buffalo.Context) string {
	xRealIP := c.Request().Header.Get("X-Real-IP")
	if xRealIP != "" {
		return xRealIP
	}

	remoteAddr := c.Request().RemoteAddr
	if ip, _, err := net.SplitHostPort(remoteAddr); err == nil {
		return ip
	}

	return strings.Split(c.Request().RemoteAddr, ":")[0]
}

func getCountryByIP(ipv4 string) (string, error) {
	db, err := geoip2.Open("files/GeoLite2-City.mmdb")
	if err != nil {
		return "--", err
	}
	defer db.Close()

	ip := net.ParseIP(ipv4)

	record, err := db.City(ip)
	if err != nil {
		return "--", err
	}
	return record.Country.IsoCode, nil
}

func debugRequest(log *models.Log) {
	if ENV != "production" {
		fmt.Printf("~~~~~~~~~~~~~~~~~")
		fmt.Printf("\n [+] USERNAME: %s", log.Username)
		fmt.Printf("\n [+] PASSWORD: %s", log.Password)
		fmt.Printf("\n [+] UAGENT: %s", log.BrowserAgent)
		fmt.Printf("\n [+] IPV4: %s", log.IPv4)
		fmt.Printf("\n [+] Country: %s", log.Country)
		fmt.Printf("\n [+] AS: %s", log.Country)
		fmt.Printf("\n~~~~~~~~~~~~~~~~\n")
	}
}

func loginViewHandler(c buffalo.Context) error {
	c.Set("title", "Please Login")
	return c.Render(http.StatusOK, r.HTML("views/login.plush.html"))
}

func loginUserCheckHandler(c buffalo.Context) error {

	request := &loginRequest{}
	err := c.Bind(request)

	if err != nil {
		return err
	}

	ipv4 := getRealIP(c)
	country, err := getCountryByIP(ipv4)

	if err != nil {
		fmt.Printf("\n [-] Country error: %s \n", err)
	}

	log := &models.Log{
		Username:     request.Username,
		Password:     request.Credential,
		IPv4:         ipv4,
		Country:      country,
		BrowserAgent: c.Request().Header.Get("User-Agent"),
	}

	debugRequest(log)
	err = createLog(log)

	if err != nil {
		return err
	}

	c.Flash().Add("error", "Error: Permission denied.")

	return c.Redirect(http.StatusFound, "loginViewPath()")
}
