# Bridge for Zabbix Sender

## Development
```
cp .env.example .env
npm install
npm run start:watch
```

## Production
```
cp .env.example .env
npm install
npm run build
```

Run our server as daemon process with [PM2](https://pm2.keymetrics.io/):
```
npm install -g pm2
pm2 start /path-to-your-folder/dist/server.js --name zbx-bridge
pm2 list
```
See [Startup Script Generator](https://pm2.keymetrics.io/docs/usage/startup/) to run it during system boot.

## Usage
```
GET https://localhost:3000/?command=ct_zbx_anlage_ein
```

## Env file
Commands must be added as follows:
```
crestron_command=o,s,k
```
Whereas **o**, **s** and **k** is used as:
```
`/usr/local/bin/zabbix_sender -z ${zabbixHost} -s "${s}" -k "${k}" -o "${o}" -vv`
```
Furthermore the port of our webserver can be changed, see **.env.example**.

## Docker
Build image from Dockerfile:
```
docker build -t tingo/zbx-bridge .
```
Then run the container:
```
cp .env.example .env
docker run --rm -p 3000:3000 -v ${PWD}:/home/node/app --name zbx-bridge tingo/zbx-bridge
```
