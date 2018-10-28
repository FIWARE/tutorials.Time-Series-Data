[![FIWARE Banner](https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png)](https://www.fiware.org/developers)

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://www.fiware.org/developers/catalogue/)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Time-Series-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/fiware.svg)](https://stackoverflow.com/questions/tagged/fiware)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-blue.svg)](https://fiware-ges.github.io/core.Orion/api/v2/stable/)
<br/>
[![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

This tutorial is an introduction to
[FIWARE QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) - a
generic enabler which is used to persist context data into a **CrateDB**
database. The tutorial activates the IoT sensors connected in the
[previous tutorial](https://github.com/Fiware/tutorials.IoT-Agent) and persists
measurements from those sensors into the database. The **CrateDB** HTTP
endpoint is then used to retrieve time-based aggregations of that data. The
results are visualized on a graph or via the **Grafana** time series analytics
tool.

The tutorial uses [cUrl](https://ec.haxx.se/) commands throughout, but is also
available as
[Postman documentation](https://fiware.github.io/tutorials.Time-Series-Data/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d24facc3c430bb5d5aaf)

-   このチュートリアルは[日本語](README.ja.md)でもご覧いただけます。

# Contents

-   [Persisting and Querying Time Series Data (CrateDB)](#persisting-and-querying-time-series-data-cratedb)
    -   [Analyzing time series data](#analyzing-time-series-data)
-   [Architecture](#architecture)
-   [Prerequisites](#prerequisites)
    -   [Docker and Docker Compose](#docker-and-docker-compose)
    -   [Cygwin for Windows](#cygwin-for-windows)
-   [Start Up](#start-up)
-   [Connecting FIWARE to a CrateDB Database via QuantumLeap](#connecting-fiware-to-a-cratedb-database-via-quantumleap)
    -   [CrateDB Database Server Configuration](#cratedb-database-server-configuration)
    -   [QuantumLeap Configuration](#quantumleap-configuration)
    -   [Grafana Configuration](#grafana-configuration)
    -   [Setting up Subscriptions](#setting-up-subscriptions)
        -   [Aggregate Motion Sensor Count Events](#aggregate-motion-sensor-count-events)
        -   [Sample Lamp Luminosity](#sample-lamp-luminosity)
    -   [Time Series Data Queries (CrateDB)](#time-series-data-queries-cratedb)
        -   [Read Schemas](#read-schemas)
        -   [Read Tables](#read-tables)
        -   [List the first N Sampled Values](#list-the-first-n-sampled-values)
        -   [List N Sampled Values at an Offset](#list-n-sampled-values-at-an-offset)
        -   [List the latest N Sampled Values](#list-the-latest-n-sampled-values)
        -   [List the Sum of values over a time period](#list-the-sum-of-values-over-a-time-period)
        -   [List the Minimum Values over a Time Period](#list-the-minimum-values-over-a-time-period)
        -   [List the Maximum Values over a Time Period](#list-the-maximum-values-over-a-time-period)
        -   [List the Average Values over a Time Period](#list-the-average-values-over-a-time-period)
-   [Accessing Time Series Data Programmatically](#accessing-time-series-data-programmatically)
    -   [Displaying CrateDB data as a Grafana Dashboard](#displaying-cratedb-data-as-a-grafana-dashboard)
        -   [Logging in](#logging-in)
        -   [Configuring a Data Source](#configuring-a-data-source)
        -   [Configuring a Dashboard](#configuring-a-dashboard)
-   [Next Steps](#next-steps)

# Persisting and Querying Time Series Data (CrateDB)

> "Forever is composed of nows."
>
> — Emily Dickinson

[Previous tutorials](https://github.com/Fiware/tutorials.Historic-Context) have
shown how to persist historic context data into a range of databases such as
**MySQL** and **PostgreSQL**. Furthermore, the
[Short Term Historic](https://github.com/Fiware/tutorials.Short-Term-History)
tutorial has introduced the
[STH-Comet](https://fiware-sth-comet.readthedocs.io/) generic enabler for
persisting and querying historic context data using a **MongoDB** database.

FIWARE [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) is an
alternative generic enabler created specifically for data persistence into the
**CrateDB** time-series database, and therefore offers an alternative to the
[STH-Comet](https://fiware-sth-comet.readthedocs.io/).

[CrateDB](https://crate.io/) is a distributed SQL DBMS designed for use with
the internet of Things. It is capable of ingesting a large number of data points
per second and can be queried in real-time. The database is designed for the
execution of complex queries such as geospatial and time series data. Retrieval
of this historic context data allows for the creation of graphs and dashboards
displaying trends over time.

A summary of the differences can be seen below:

| QuantumLeap                                                                    | STH-Comet                                                                                |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Offers an NGSI v2 interface for notifications                                   | Offers an NGSI v1 interface for notifications                                            |
| Persists Data to a CrateDB database                                            | Persists Data to MongoDB database                                                       |
| Does not offer its own HTTP endpoint for queries, use the CrateDB SQL endpoint | Offers its own HTTP endpoint for queries - MongoDB database cannot be accessed directly |
| The CrateDB SQL endpoint is able to satisfy complex data queries using SQL     | STH-Comet offers a limited set of queries                                                |
| CrateDB is a distributed SQL DBMS built atop NoSQL storage                     | MongoDB is a document based NoSQL database                                              |

Further details about the differences between the underlying database engines
can be found [here](https://db-engines.com/en/system/CrateDB%3BMongoDB)

## Analyzing time series data

The appropriate use of time series data analysis will depend on your use case
and the reliability of the data measurements you receive. Time series data
analysis can be used to answer questions such as:

-   What was the maximum measurement of a device within a given time period?
-   What was the average measurement of a device within a given time period?
-   What was the sum of the measurements sent by a device within a given time
    period?

It can also be used to reduce the significance of each individual data point to
exclude outliers by smoothing.

#### Grafana

[Grafana](https://grafana.com/) is an open source software for time series
analytics tool which will be used during this tutorial. It integrates with a
variety of time-series databases including **CrateDB** It is available licensed
under the Apache License 2.0. More information can be found at
https://grafana.com/

#### Device Monitor

For the purpose of this tutorial, a series of dummy IoT devices have been
created, which will be attached to the context broker. Details of the
architecture and protocol used can be found in the
[IoT Sensors tutorial](https://github.com/Fiware/tutorials.IoT-Sensors). The
state of each device can be seen on the UltraLight device monitor web page found
at: `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.Time-Series-Data/img/device-monitor.png)

#### Device History

Once **QuantumLeap** has started aggregating data, the historical state of each
device can be seen on the device history web page found at:
`http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/history-graphs.png)

# Architecture

This application builds on the components and dummy IoT devices created in
[previous tutorials](https://github.com/Fiware/tutorials.IoT-Agent/). It will
use three FIWARE components: the
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/), the
[IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/),
and [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) .

Therefore the overall architecture will consist of the following elements:

-   The **FIWARE Generic Enablers**:
    -   The FIWARE
        [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)
        which will receive requests using
        [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2)
    -   The FIWARE
        [IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/)
        which will receive northbound measurements from the dummy IoT devices in
        [Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        format and convert them to
        [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) requests
        for the context broker to alter the state of the context entities
    -   FIWARE [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/)
        subscribe to context changes and persist them into a **CrateDB**
        database
-   A [MongoDB](https://www.mongodb.com/) database:
    -   Used by the **Orion Context Broker** to hold context data information
        such as data entities, subscriptions and registrations
    -   Used by the **IoT Agent** to hold device information such as device URLs
        and Keys
-   A [CrateDB](https://crate.io/) database:

    -   Used as a data sink to hold time-based historical context data
    -   offers an HTTP endpoint to interpret time-based data queries

-   Three **Context Providers**:
    -   The **Stock Management Frontend** is not used in this tutorial. It does
        the following:
        -   Display store information and allow users to interact with the dummy
            IoT devices
        -   Show which products can be bought at each store
        -   Allow users to "buy" products and reduce the stock count.
    -   A webserver acting as set of
        [dummy IoT devices](https://github.com/Fiware/tutorials.IoT-Sensors)
        using the
        [Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        protocol running over HTTP.
    -   The **Context Provider NGSI** proxy is not used in this tutorial. It
        does the following:
        -   receive requests using
            [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2)
        -   makes requests to publicly available data sources using their own
            APIs in a proprietary format
        -   returns context data back to the Orion Context Broker in
            [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2)
            format.

Since all interactions between the elements are initiated by HTTP requests, the
entities can be containerized and run from exposed ports.

The overall architecture can be seen below:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/architecture.png)

# Prerequisites

## Docker and Docker Compose

To keep things simple all components will be run using
[Docker](https://www.docker.com). **Docker** is a container technology which
allows to different components isolated into their respective environments.

-   To install Docker on Windows follow the instructions
    [here](https://docs.docker.com/docker-for-windows/)
-   To install Docker on Mac follow the instructions
    [here](https://docs.docker.com/docker-for-mac/)
-   To install Docker on Linux follow the instructions
    [here](https://docs.docker.com/install/)

**Docker Compose** is a tool for defining and running multi-container Docker
applications. A series of
[YAML files](https://raw.githubusercontent.com/Fiware/tutorials.Historic-Context/master/cygnus)
are used configure the required services for the application. This means all
container services can be brought up in a single command. Docker Compose is
installed by default as part of Docker for Windows and Docker for Mac, however
Linux users will need to follow the instructions found
[here](https://docs.docker.com/compose/install/)

You can check your current **Docker** and **Docker Compose** versions using the
following commands:

```console
docker-compose -v
docker version
```

Please ensure that you are using Docker version 18.03 or higher and Docker
Compose 1.21 or higher and upgrade if necessary.

## Cygwin for Windows

We will start up our services using a simple Bash script. Windows users should
download [cygwin](http://www.cygwin.com/) to provide a command-line
functionality similar to a Linux distribution on Windows.

# Start Up

Before you start you should ensure that you have obtained or built the necessary
Docker images locally. Please clone the repository and create the necessary
images by running the commands as shown:

```console
git clone git@github.com:Fiware/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data

./services create
```

Thereafter, all services can be initialized from the command-line by running the
[services](https://github.com/Fiware/tutorials.Time-Series-Data/blob/master/services)
Bash script provided within the repository:

```console
./services start
```

> :information_source: **Note:** If you want to clean up and start over again
> you can do so with the following command:
>
> ```console
> ./services stop
> ```

# Connecting FIWARE to a CrateDB Database via QuantumLeap

In the configuration, **QuantumLeap** listens to NGSI v2 notifications on port
`8868` and persists historic context data to the **CrateDB**. **CrateDB** is
accessible using port `4200` and can either be queried directly or attached to
the Grafana analytics tool. The rest of the system providing the context data
has been described in previous tutorials

## CrateDB Database Server Configuration

```yaml
cratedb:
    image: crate:2.3
    hostname: cratedb
    ports:
        - "4200:4200"
        - "4300:4300"
    command:
        -Ccluster.name=democluster -Chttp.cors.enabled=true
        -Chttp.cors.allow-origin="*"
```

## QuantumLeap Configuration

```yaml
quantumleap:
    image: smartsdk/quantumleap
    hostname: quantumleap
    ports:
        - "8668:8668"
    depends_on:
        - cratedb
    environment:
        - CRATE_HOST=cratedb
```

## Grafana Configuration

```yaml
grafana:
    image: grafana/grafana
    depends_on:
        - cratedb
    ports:
        - "3003:3000"
    environment:
        - GF_INSTALL_PLUGINS=crate-datasource,grafana-clock-panel,grafana-worldmap-panel
```

The `quantumleap` container is listening on one port:

-   The Operations for port for QuantumLeap - `8668` is where the service will
    be listening for notifications from the Orion context broker

The `CRATE_HOST` environment variable defines the location where the data will
be persisted.

The `cratedb` container is listening on two ports:

-   The Admin UI is available on port `4200`
-   The transport protocol is available on `port 4300`

The `grafana` container has connected up port `3000` internally with port `3003`
externally. This is because the Grafana UI is usually available on port `3000`,
but this port has already been taken by the dummy devices UI so it has been
shifted to another port. The Grafana Environment variables are described within
their own [documentation](http://docs.grafana.org/installation/configuration/).
The configuration ensures we will be able to connect to the **CrateDB**
database later on in the tutorial

### Generating Context Data

For the purpose of this tutorial, we must be monitoring a system where the
context is periodically being updated. The dummy IoT Sensors can be used to do
this. Open the device monitor page at `http://localhost:3000/device/monitor` and
unlock a **Smart Door** and switch on a **Smart Lamp**. This can be done by
selecting an appropriate the command from the drop down list and pressing the
`send` button. The stream of measurements coming from the devices can then be
seen on the same page:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/door-open.gif)

## Setting up Subscriptions

Once a dynamic context system is up and running, we need to inform **Quantum
Leap** directly of changes in context. As expected this is done using the
subscription mechanism of the **Orion Context Broker**. The `attrsFormat=legacy`
attribute is not required since **QuantumLeap** accepts NGSI v2 notifications
directly.

More details about subscriptions can be found in previous tutorials

### Aggregate Motion Sensor Count Events

The rate of change of the **Motion Sensor** is driven by events in the
real-world. We need to receive every event to be able to aggregate the results.

This is done by making a POST request to the `/v2/subscription` endpoint of the
**Orion Context Broker**.

-   The `fiware-service` and `fiware-servicepath` headers are used to filter the
    subscription to only listen to measurements from the attached IoT Sensors
-   The `idPattern` in the request body ensures that **QuantumLeap** will be
    informed of all **Motion Sensor** data changes.
-   The `notification` URL must match the exposed port.

The `metadata` attribute ensures that the `time_index` column within the
**CrateDB** database will match the data found within the **MongoDB** database
used by the **Orion Context Broker** rather than using the creation time of the
record within the **CrateDB** itself.

#### :one: Request:

```console
curl -iX POST \
  'http://localhost:1026/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify QuantumLeap of all Motion Sensor count changes",
  "subject": {
    "entities": [
      {
        "idPattern": "Motion.*"
      }
    ],
    "condition": {
      "attrs": [
        "count"
      ]
    }
  },
  "notification": {
    "http": {
      "url": "http://quantumleap:8668/v2/notify"
    },
    "attrs": [
      "count"
    ],
    "metadata": ["dateCreated", "dateModified"]
  }
}'
```

### Sample Lamp Luminosity

The luminosity of the Smart Lamp is constantly changing, we only need to sample
the values to be able to work out relevant statistics such as minimum and
maximum values and rates of change.

This is done by making a POST request to the `/v2/subscription` endpoint of the
**Orion Context Broker** and including the `throttling` attribute in the request
body.

-   The `fiware-service` and `fiware-servicepath` headers are used to filter the
    subscription to only listen to measurements from the attached IoT Sensors
-   The `idPattern` in the request body ensures that **QuantumLeap** will be
    informed of all **Motion Sensor** data changes.
-   The `notification` URL must match the exposed port.
-   The `throttling` value defines the rate that changes are sampled.

The `metadata` attribute ensures that the `time_index` column within the
**CrateDB** database will match the data found within the **MongoDB** database
used by the **Orion Context Broker** rather than using the creation time of the
record within the **CrateDB** itself.

#### :two: Request:

```console
curl -iX POST \
  'http://localhost:1026/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify QuantumLeap to sample Lamp changes every five seconds",
  "subject": {
    "entities": [
      {
        "idPattern": "Lamp.*"
      }
    ],
    "condition": {
      "attrs": [
        "luminosity"
      ]
    }
  },
  "notification": {
    "http": {
      "url": "http://quantumleap:8668/v2/notify"
    },
    "attrs": [
      "luminosity"
    ],
    "metadata": ["dateCreated", "dateModified"]
  },
  "throttling": 5
}'
```

## Time Series Data Queries (CrateDB)

**CrateDB** offers an
[HTTP Endpoint](https://crate.io/docs/crate/reference/en/latest/interfaces/http.html)
that can be used to submit SQL queries. The endpoint is accessible under
`<servername:port>/_sql`.

SQL statements are sent as the body of POST requests in JSON format, where the
SQL statement is the value of the `stmt` attribute.

### Read Schemas

**QuantumLeap** does not currently offer any interfaces to query for the
persisted data A good method to see if data is being persisted is to check to
see if a `table_schema` has been created. This can be done by making a request
to the **CrateDB** HTTP endpoint as shown:

#### :three: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW SCHEMAS"}'
```

#### Response:

```json
{
    "cols": ["table_schema"],
    "rows": [
        ["doc"],
        ["information_schema"],
        ["sys"],
        ["mtopeniot"],
        ["pg_catalog"]
    ],
    "rowcount": 5,
    "duration": 10.5146
}
```

Schema names are formed with the `mt` prefix followed by `fiware-service` header
in lower case. The IoT Agent is forwarding measurements from the dummy IoT
devices, with the header `openiot`. These are being persisted under the
`mtopeniot` schema.

If the `mtopeniot` does not exist, then the subscription to **QuantumLeap** has
not been set up correctly. Check that the subscription exists, and has been
configured to send data to the correct location.

### Read Tables

**QuantumLeap** will persist data into separate tables within the **CrateDB**
database based on the entity type. Table names are formed with the `et` prefix
and the entity type name in lowercase.

#### :four: Request:

```console
curl -X POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW TABLES"}'
```

#### Response:

```json
{
    "cols": ["table_schema", "table_name"],
    "rows": [["mtopeniot", "etmotion"], ["mtopeniot", "etlamp"]],
    "rowcount": 2,
    "duration": 14.2762
}
```

The response shows that both **Motion Sensor** data and **Smart Lamp** data are
being persisted in the database.

### List the first N Sampled Values

This example shows the first 3 sampled luminosity values from **Lamp:001**.

The SQL statement uses `ORDER BY` and `LIMIT` clauses to sort the data. More
details can be found under within the **CrateDB**
[documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :five: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\''  ORDER BY time_index ASC LIMIT 3"}'
```

#### Response:

```json
{
    "cols": [
        "entity_id",
        "entity_type",
        "fiware_servicepath",
        "luminosity",
        "time_index"
    ],
    "rows": [
        ["Lamp:001", "Lamp", "/", 1750, 1530262765000],
        ["Lamp:001", "Lamp", "/", 1507, 1530262770000],
        ["Lamp:001", "Lamp", "/", 1390, 1530262775000]
    ],
    "rowcount": 3,
    "duration": 21.8338
}
```

### List N Sampled Values at an Offset

This example shows the fourth, fifth and sixth sampled count values from
**Motion:001**.

The SQL statement uses an `OFFSET` clause to retrieve the required rows. More
details can be found under within the **CrateDB**
[documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :six: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' LIMIT 10"}'
```

#### Response:

```json
{
    "cols": [
        "count",
        "entity_id",
        "entity_type",
        "fiware_servicepath",
        "time_index"
    ],
    "rows": [
        [0, "Motion:001", "Motion", "/", 1530262791452],
        [1, "Motion:001", "Motion", "/", 1530262792469],
        [0, "Motion:001", "Motion", "/", 1530262793472]
    ],
    "rowcount": 3,
    "duration": 54.215
}
```

### List the latest N Sampled Values

This example shows latest three sampled count values from **Motion:001**.

The SQL statement uses an `ORDER BY ... DESC` clause combined with a `LIMIT`
clause to retrieve the last N rows. More details can be found under within the
**CrateDB**
[documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :seven: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.motion WHERE entity_id = '\''Motion:001'\''  ORDER BY time_index DESC LIMIT 3"}'
```

#### Response:

```json
{
    "cols": [
        "count",
        "entity_id",
        "entity_type",
        "fiware_servicepath",
        "time_index"
    ],
    "rows": [
        [0, "Motion:001", "Motion", "/", 1530263896550],
        [1, "Motion:001", "Motion", "/", 1530263894491],
        [0, "Motion:001", "Motion", "/", 1530263892483]
    ],
    "rowcount": 3,
    "duration": 18.591
}
```

### List the Sum of values over a time period

This example shows total count values from **Motion:001** over each minute.

The SQL statement uses a `SUM` function and `GROUP BY` clause to retrieve the
relevant data. **CrateDB** offers a range of
[Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
to truncate and convert the timestamps into data which can be grouped.

#### :eight: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, SUM (count) AS sum FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' GROUP BY minute"}'
```

#### Response:

```json
{
    "cols": ["minute", "sum"],
    "rows": [
        ["2018-06-29T09:17:00.000000Z", 12],
        ["2018-06-29T09:34:00.000000Z", 10],
        ["2018-06-29T09:08:00.000000Z", 11],
        ["2018-06-29T09:40:00.000000Z", 3],
        ...etc
    ],
    "rowcount": 42,
    "duration": 22.9832
}
```

### List the Minimum Values over a Time Period

This example shows minimum luminosity values from **Lamp:001** over each minute.

The SQL statement uses a `MIN` function and `GROUP BY` clause to retrieve the
relevant data. **CrateDB** offers a range of
[Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
to truncate and convert the timestamps into data which can be grouped.

#### :nine: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MIN (luminosity) AS min FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### Response:

```json
{
    "cols": ["minute", "min"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z", 1516],
        ["2018-06-29T09:17:00.000000Z", 1831],
        ["2018-06-29T09:40:00.000000Z", 1768],
        ["2018-06-29T09:08:00.000000Z", 1868],
        ...etc
    ],
    "rowcount": 40,
    "duration": 13.1854
}
```

### List the Maximum Values over a Time Period

This example shows maximum luminosity values from **Lamp:001** over each minute.

The SQL statement uses a `MAX` function and `GROUP BY` clause to retrieve the
relevant data. **CrateDB** offers a range of
[Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
to truncate and convert the timestamps into data which can be grouped.

#### :one::zero: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MAX (luminosity) AS max FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### Response:

```json
{
    "cols": ["minute", "max"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z", 2008],
        ["2018-06-29T09:17:00.000000Z", 1911],
        ["2018-06-29T09:40:00.000000Z", 2005],
        ["2018-06-29T09:08:00.000000Z", 2008],
        ...etc
    ],
    "rowcount": 43,
    "duration": 26.7215
}
```

### List the Average Values over a Time Period

This example shows the average of luminosity values from **Lamp:001** over each
minute.

The SQL statement uses a `AVG` function and `GROUP BY` clause to retrieve the
relevant data. **CrateDB** offers a range of
[Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
to truncate and convert the timestamps into data which can be grouped.

#### :one::one: Request:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, AVG (luminosity) AS average FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### Response:

```json
{
    "cols": ["minute", "average"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z", 1874.9],
        ["2018-06-29T09:17:00.000000Z", 1867.3333333333333],
        ["2018-06-29T09:40:00.000000Z", 1909.7142857142858],
        ["2018-06-29T09:08:00.000000Z", 1955.8333333333333],
        ["2018-06-29T09:33:00.000000Z", 1933.5],
        ...etc
    ],
    "rowcount": 44,
    "duration": 22.0911
}
```

# Accessing Time Series Data Programmatically

Once the JSON response for a specified time series has been retrieved,
displaying the raw data is of little use to an end user. It must be manipulated
to be displayed in a bar chart, line graph or table listing. This is not within
the domain of **QuantumLeap** as it not a graphical tool, but can be delegated
to a mashup or dashboard component such as
[Wirecloud](https://github.com/Fiware/catalogue/blob/master/processing/README.md#Wirecloud)
or
[Knowage](https://catalogue-server.fiware.org/enablers/data-visualization-knowage)

It can also be retrieved and displayed using a third-party graphing tool
appropriate to your coding environment - for example
[chartjs](http://www.chartjs.org/). An example of this can be found within the
`history` controller in the
[Git Repository](https://github.com/Fiware/tutorials.Step-by-Step/blob/master/docker/context-provider/express-app/controllers/history.js)

The basic processing consists of two-step - retrieval and attribute mapping,
sample code can be seen below:

```javascript
function readCrateLampLuminosity(id, aggMethod) {
    return new Promise(function(resolve, reject) {
        const sqlStatement =
            "SELECT DATE_FORMAT (DATE_TRUNC ('minute', time_index)) AS minute, " +
            aggMethod +
            "(luminosity) AS " +
            aggMethod +
            " FROM mtopeniot.etlamp WHERE entity_id = 'Lamp:" +
            id +
            "' GROUP BY minute ORDER BY minute";
        const options = {
            method: "POST",
            url: crateUrl,
            headers: { "Content-Type": "application/json" },
            body: { stmt: sqlStatement },
            json: true
        };
        request(options, (error, response, body) => {
            return error ? reject(error) : resolve(body);
        });
    });
}
```

```javascript
function crateToTimeSeries(crateResponse, aggMethod, hexColor) {
    const data = [];
    const labels = [];
    const color = [];

    if (crateResponse && crateResponse.rows && crateResponse.rows.length > 0) {
        _.forEach(crateResponse.rows, element => {
            const date = moment(element[0]);
            data.push({ t: date, y: element[1] });
            labels.push(date.format("HH:mm"));
            color.push(hexColor);
        });
    }

    return {
        labels,
        data,
        color
    };
}
```

The modified data is then passed to the frontend to be processed by the
third-party graphing tool. The result is shown here:
`http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

## Displaying CrateDB data as a Grafana Dashboard

**CrateDB** has been chosen as the time-series data sink, as it integrates
seamlessly with the [Grafana](https://grafana.com/) time series analytics tool.
Grafana can be used to display the aggregated sensor data - a full tutorial on
building dashboards can be found
[here](https://www.youtube.com/watch?v=sKNZMtoSHN4). The simpified instructions
below summarize how to connect and display a graph of the Lamp `luminosity`
data.

### Logging in

The `docker-compose` file has started an instance of the Grafana UI listening on
port `3003`, so the login page can be found at: `http://localhost:3003/login`.
The default username is `admin` and the default password is `admin`

### Configuring a Data Source

After logging in, a datasource must be set up at
`http://localhost:3003/datasources` with the following values

-   **Name** Lamp
-   **Type** Crate

-   **URL** `http://cratedb:4200`
-   **Access** Server (Default)

-   **Schema** mtopeniot
-   **Table** etlamp
-   **Time column** time_index

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-settings.png)

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-crate-connect.png)

Click on the Save and test button and the message _Data Source added_ will be
returned

### Configuring a Dashboard

To display a new dashboard, you can either click the **+** button and select
**New Dashboard** or go directly to
`http://localhost:3003/dashboard/new?orgId=1`. Thereafter select the **Graph**
dashboard type.

To configure the dashboard click on Panel title and select edit from the
dropdown list.

The following values in **bold text** need to be placed in the graphing wizard

-   Data Source **Lamp** (selected from the previously created Data Sources)
-   FROM **mtopeniot.etlamp** WHERE **entity_id** = **Lamp:001**
-   Select **Min** **luminosity**
-   Group By time Interval **Minute** Format as **Time Series**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-graph.png)

The final result can be seen below:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-result.png)

# Next Steps

Want to learn how to add more complexity to your application by adding advanced
features? You can find out by reading the other
[tutorials in this series](https://fiware-tutorials.rtfd.io)

---

## License

[MIT](LICENSE) © FIWARE Foundation e.V.
