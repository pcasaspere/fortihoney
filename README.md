# FortiHoney Honeypot Project

## Disclaimer
**IMPORTANT:** This honeypot software is developed for educational and research purposes only. The primary aim is to study and improve security measures, not to engage in or encourage illegal activities. Any misuse of this software for purposes other than those stated, including unauthorized access to computer systems, is strictly prohibited and may be illegal under local, state, federal, or international law. By using this software, you agree to use it responsibly, ethically, and within the bounds of legality. The developers and distributors of this software bear no responsibility for any illicit or unauthorized use.

## Overview
FortiHoney simulates the login portal of a FortiGate firewall to act as a honeypot, attracting malicious actors attempting unauthorized access. When an attacker tries to log in, the honeypot captures and logs their IP address, username, and password. This project aims to provide security researchers and IT professionals with a tool to identify potential threats and analyze attack patterns without exposing real network assets.

## Features
- Simulates a FortiGate login portal to attract potential attackers
- Logs IP addresses, usernames, and passwords of attempted logins
- Geo-locates IP addresses to identify the attacker's possible location
- Records browser user-agent strings to analyze the tools used in the attacks
- Offers a debug mode for detailed request logging in development environments


## Installation and Setup

### Prerequisites
- GoLang (1.15 or newer)
- Buffalo framework
- A PostgreSQL database
- GeoLite2-City database file for IP geolocation

### Step-by-Step Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/fortihoney.git
    cd fortiHoney
    ```

2. **Setup Database**
    Ensure SQLite/PostgreSQL is installed and running. Create a new database for the honeypot logs.

3. **Environment Configuration**
    Configure the necessary environment variables, including the database connection string in a `.env` file or equivalent.

4. **GeoLite2-City Database**
    Download the GeoLite2-City database file from MaxMind and place it in the `files` directory.

5. **Install Dependencies**
    ```bash
    go mod tidy
    ```

6. **Run Migrations**
    ```bash
    buffalo pop migrate
    ```

7. **Start the Server in develop mode**
    ```bash
    buffalo serve
    ```
    This will start the honeypot server, listening for incoming connections that simulate login attempts.

8. **Deploy**

    Oficial documentation:
    
    - [Packing](https://gobuffalo.io/documentation/deploy/packing/)
    - [Systemd Service](https://gobuffalo.io/documentation/deploy/systemd/)
    - [Using a proxy](https://gobuffalo.io/documentation/deploy/proxy/)

## Usage
Deploy FortiHoney within your network in a controlled and isolated environment, where it can safely attract and log unauthorized access attempts. Ensure it does not have access to real or sensitive systems and networks.

### Monitoring and Analysis
Review the captured data regularly to analyze attack patterns and potential security threats. This information can be vital for enhancing your security posture.

```bash
sqlite3 fortihoney_fortihoney_development.sqlite
```

```sql
SELECT * FROM LOGS ORDER BY created_at desc;
```

## Contributing
Contributions to the FortiHoney project are welcome. Please ensure that any pull requests or issues are clearly described and are in line with the project's goals of security research and education.

## License
This project is licensed under MIT, which allows for modification and redistribution for non-commercial purposes.

## Acknowledgements
- GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com)
- Buffalo framework for Go web applications

For more comprehensive and personalized assistance in setting up honeypots and other security measures, consider consulting professional services.
