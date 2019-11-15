# Bridge for Zabbix Sender

## Development
```
npm install
npm run start:watch
```

## Production
```
npm install
npm build
```

Run the server indefinitely with PM2:
```
npm install -g pm2
npm start /path-to-your-folder/dist/server.js
```
See [Startup Script Generator](https://pm2.keymetrics.io/docs/usage/startup/) to run it during system boot.

## Usage
```
GET https://localhost:3000/?command=ct_zbx_anlage_ein
```

## Env file
Commands must be added as follows:
```
crestron_command=s,k
```
Further the port can be defined, see **.env.example**.