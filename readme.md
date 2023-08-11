# Bridge for Zabbix

## Install

### Development

```
cp .env.example .env
cp commands.json.example commands.json
nvm install
npm install
npm run start:watch
```

### Production

```
cp .env.example .env
cp commands.json.example commands.json
nvm install
npm install
npm run build
```

Run our server as a daemon process with [PM2](https://pm2.keymetrics.io/):

```
npm install -g pm2
pm2 start /path-to-your-folder/dist/server.js --name zbx-bridge
pm2 list
```

See [Startup Script Generator](https://pm2.keymetrics.io/docs/usage/startup/) to run it during system boot.

**Deploy bash command:**
```
alias zbx-bridge-deploy="pm2 delete zbx-bridge && cd /home/pi/zbx-bridge && git pull origin master && npm install && npm run build && npm run production"
```

## Usage

```
GET https://localhost:3000/?command=ct_zbx_anlage_ein
```

## Env file

All environment specific settings go to **.env**.

```
PORT=3000
ZABBIX_SENDER_PATH=/usr/local/bin/zabbix_sender
ZABBIX_HOST=127.0.0.1
API_HOST=https://api.zabbix.io
API_AUTH=iojsdf892389jsdf89j23w98esdfj2389
```

## Commands file

Commands must be added to **commands.json** as follows:

### Zabbix Sender

Must include **type=sender** property. e.g.

```
"ct_zbx_anlage_ein": {
    "type": "sender",
    "key": "tgo.test",
    "value": 1,
    "name": "host.zbx.host.test"
},
```

The command will be run as follows

```
`/usr/local/bin/zabbix_sender -z ${zabbixHost} -s "${name}" -k "${key}" -o "${value}" -vv`
```

Whereas **z**, **o**, **s** and **k** is used as:

- z - Zabbix server host (IP address can be used as well)
- s - technical name of monitored host (as registered in Zabbix frontend)
- k - item key
- o - value to send

### Zabbix API

Must include **type=api** property. e.g.

```
"ct_zbx_macro_update": {
    "type": "api",
    "method":"usermacro.massUpdate",
    "params":{
       "macros":[
          {
             "macro":844,
             "value":"public"
          }
       ]
    }
  }
```

See the [Zabbix docs](https://www.zabbix.com/documentation/current/manual/api/reference/usermacro/update) for more information

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
