[![FIWARE Banner](https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png)](https://www.fiware.org/developers)

このチュートリアルでは、コンテキスト・データを **Crate-DB** データベースに保存するために使用される、Generic Enabler である [FIWARE Quantum Leap](https://smartsdk.github.io/ngsi-timeseries-api/) について紹介します。このチュートリアルでは、[以前のチュートリアル](https://github.com/Fiware/tutorials.IoT-Agent)で接続した IoT センサを有効にし、それらのセンサからの測定値をデータベースに保存します。**Crate-DB** HTTP エンドポイントは、そのデータの時間ベースの集計を取得するために使用されます。結果は、グラフまたは **Grafana** 時系列分析ツールを介して視覚化されます。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、[Postman documentation](http://fiware.github.io/tutorials.Time-Series-Data/) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d24facc3c430bb5d5aaf)

* このチュートリアルは[日本語](README.ja.md)でもご覧いただけます。

# 内容

- [時系列データの永続化とクエリ (Crate-DB)](#persisting-and-querying-time-series-data-crate-db)
  * [時系列データの解析](#analyzing-time-series-data)
- [アーキテクチャ](#architecture)
- [前提条件](#prerequisites)
  * [Docker と Docker Compose](#docker-and-docker-compose)
  * [Cygwin for Windows](#cygwin-for-windows)
- [起動](#start-up)
- [Quantum Leap を介して Crate-DB データベースに FIWARE を接続](#connecting-fiware-to-a-crate-db-database-via-quantum-leap)
  * [Crate-DB データベース・サーバの設定](#crate-db-database-server-configuration)
  * [Quantum Leap の設定](#quantum-leap-configuration)
  * [Grafana の設定](#grafana-configuration)
  * [サブスクリプションのセットアップ](#setting-up-subscriptions)
    + [モーション・センサのカウント・イベントの集計](#aggregate-motion-sensor-count-events)
    + [ランプの明度のサンプリング](#sample-lamp-luminosity)
  * [時系列データクエリ (Crate-DB)](#time-series-data-queries-crate-db)
    + [スキーマの読み込み](#read-schemas)
    + [テーブルの読み込み](#read-tables)
    + [最初の N 個のサンプリング値をリスト](#list-the-first-n-sampled-values)
    + [オフセットで N 個のサンプリングされた値をリスト](#list-n-sampled-values-at-an-offset)
    + [最新の N 個のサンプリング値をリスト](#list-the-latest-n-sampled-values)
    + [一定期間にわたる値の合計をリスト](#list-the-sum-of-values-over-a-time-period)
    + [一定期間にわたる値の最小値をリスト](#list-the-minimum-values-over-a-time-period)
    + [一定期間にわたる値の最大値をリスト](#list-the-maximum-values-over-a-time-period)
    + [一定期間にわたる値の平均値をリスト](#list-the-average-values-over-a-time-period)
- [次のステップ](#next-steps)

<a name="persisting-and-querying-time-series-data-crate-db"></a>
# 時系列データの永続化とクエリ (Crate-DB)

> "Forever is composed of nows."
>
> — Emily Dickinson

[以前のチュートリアル](https://github.com/Fiware/tutorials.Historic-Context)では、履歴コンテキスト・データを MySQL や PostgreSQL などのデータベースに永続化する方法を示しました。さらに、[Short Term Historic](https://github.com/Fiware/tutorials.Short-Term-History) のチュートリアルでは、**Mongo-DB** データベースを使用して履歴コンテキスト・データを永続化およびクエリするための [STH-Comet](http://fiware-sth-comet.readthedocs.io/) Generic Enabler を導入しました。

FIWARE [Quantum Leap](https://smartsdk.github.io/ngsi-timeseries-api/) は、**Crate-DB** 時系列データベースへのデータ永続性のために特別に作成された代替 Generic Enabler であるり、[STH-Comet](http://fiware-sth-comet.readthedocs.io/) に代わるものです。

[Crate-DB](https://crate.io/) は、Things of Internet で使用するために設計された分散 SQL DBMS です。1秒間に多数のデータ・ポイントを取り込むことができ、リアルタイムでクエリすることができます。このデータベースは、地理空間データや時系列データなどの複雑なクエリの実行用に設計されています。この履歴データを取得することで、グラフやダッシュボードを作成し、時間の経過とともに傾向を表示することができます。

違いの概要を以下に示します :

| Quantum Leap               | STH-Comet |
|----------------------------|-----------|
| 通知のための NGSI v2 インターフェイスを提供します | 通知のための NGSI v1 インターフェイスを提供します |
| データを Crate-DB データベースに保存します  | データを Mongo-DB データベースに保存します |
| クエリ 用に独自の HTTP エンドポイントを提供しません。Crate-DB SQL エンドポイント を使用します | クエリ用に独自の HTTPエンドポイントを提供します。Mongo-DB データベースに直接アクセスすることはできません |
| Crate-DB SQL エンドポイントは、SQL を使用して複雑なデータクエリを満たすことができます | STH-Comet は限定された一連のクエリを提供していますs |
| Crate-DBは、NoSQL ストレージの上に構築された分散 SQL DBMS です | Mongo-DB は、ドキュメント・ベースの NoSQL データベースです |

基盤となるデータベースエンジンの相違点の詳細は、[こちら](https://db-engines.com/en/system/CrateDB%3BMongoDB)を参照してください。

<a name="analyzing-time-series-data"></a>
## 時系列データの解析

時系列データ分析を適切に使用するかどうかは、ユースケースと受け取るデータ測定の信頼性によって異なります。時系列データ分析を使用すると、次のような質問に答えることができます。

* 一定期間内のデバイスの最大測定値はどれくらいでしたか？
* 一定期間内のデバイスの平均測定値はどれくらいでしたか？
* 一定期間内にデバイスから送信された測定値の合計はどれくらいですか？

また、個々のデータポイントの重要性を減らして、スムージングによって外れ値を除外するために使用することもできます。


#### Grafana

[Grafana](https://grafana.com/) は、このチュートリアルで使用する時系列解析ツール用のオープンソースソフトウェアです。これは、**Crate-DB** を含む様々な時系列データベースと統合されています。Apache License 2.0 のライセンスで利用可能です。詳細は、https://grafana.com/ をご覧ください。


#### デバイス・モニタ

このチュートリアルの目的のために、一連のダミー IoT デバイスが作成され、Context Broker に接続されます。使用しているアーキテクチャとプロトコルの詳細は、[IoT Sensors チュートリアル](https://github.com/Fiware/tutorials.IoT-Sensors)にあります。各デバイスの状態は、次の UltraLight デバイス・モニタの Web ページで確認できます : `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.Time-Series-Data/img/device-monitor.png)

#### デバイス履歴

**Quantum Leap** がデータの集計を開始すると、各デバイスの履歴の状態は、デバイス履歴の Web ページに表示されます : `http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/history-graphs.png)


<a name="architecture"></a>
# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/Fiware/tutorials.IoT-Agent/) で作成したコンポーネントとダミー IoT デバイスをベースにしています 。[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)，[IoT Agent for Ultralight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/) および [Quantum Leap](https://smartsdk.github.io/ngsi-timeseries-api/) の 3つの FIWARE コンポーネントを使用します。

したがって、全体的なアーキテクチャは次の要素で構成されます :

* **FIWARE Generic Enablers** :
  * FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は、[NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
  * FIWARE [IoT Agent for Ultralight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/) は、Ultralight 2.0 形式のダミー IoT デバイスからノース・バウンドの測定値を受信し、Context Broker の[NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) リクエストに変換してコンテキスト・エンティティの状態を変更します
  * FIWARE [Quantum Leap](https://smartsdk.github.io/ngsi-timeseries-api/) はコンテキストの変更をサブスクライブし、**Crate-DB** データベースに永続化します
* [MongoDB](https://www.mongodb.com/) データベース : 
  * **Orion Context Broker**が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・データ情報を保持するために使用します
  * デバイスの URLs や Keys などのデバイス情報を保持するために **IoT Agent** によって使用されます
* [Crate-DB](https://crate.io/) データベース：
  * 時間ベースの履歴コンテキスト・データを保持するデータシンクとして使用されます
  * 時間ベースのデータクエリを解釈する HTTP エンドポイントを提供します
* 3つの**コンテキストプロバイダ** :
  * **在庫管理フロントエンド**は、このチュートリアルで使用していません。これは以下を行います :
     + 店舗情報を表示し、ユーザーがダミー IoT デバイスと対話できるようにします
     + 各店舗で購入できる商品を表示します
     + ユーザが製品を購入して在庫数を減らすことを許可します
  * HTTP 上で動作する [Ultralight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) プロトコルを使用して、[ダミー IoT デバイス](https://github.com/Fiware/tutorials.IoT-Sensors)のセットとして機能する Web サーバ
  * このチュートリアルでは、**コンテキスト・プロバイダの NGSI proxy** は使用しません。これは以下を行います :
     + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
     + 独自の API を独自のフォーマットで使用して、公開されているデータ・ソースへのリクエストを行います
     + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) 形式でコンテキスト・データ を Orion Context Broker に返します

要素間のすべての対話は HTTP リクエストによって開始されるため、エンティティはコンテナ化され、公開されたポートから実行されます。

全体的なアーキテクチャを以下に示します :

![](https://fiware.github.io/tutorials.Time-Series-Data/img/architecture.png)


<a name="prerequisites"></a>
# 前提条件

<a name="docker-and-docker-compose"></a>
## Docker と Docker Compose

物事を単純にするために、両方のコンポーネントが [Docker](https://www.docker.com) を使用して実行されます。**Docker** は、さまざまコンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

* Docker Windows にインストールするには、[こちら](https://docs.docker.com/docker-for-windows/)の手順に従ってください
* Docker Mac にインストールするには、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
* Docker Linux にインストールするには、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。[YAML file](https://raw.githubusercontent.com/Fiware/tutorials.Getting-Started/master/docker-compose.yml) ファイルは、アプリケーションのために必要なサービスを設定する使用されています。つまり、すべてのコンテナ・サービスは1つのコマンドで呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows とDocker for Mac の一部としてインストールされますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)に記載されている手順に従う必要があります。

<a name="cygwin-for-windows"></a>
## Cygwin for Windows

シンプルな bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/) をダウンロードして、Windows 上の Linux ディストリビューションと同様のコマンドライン機能を提供する必要があります。

<a name="start-up"></a>
# 起動

開始する前に、必要な Docker イメージをローカルで取得または構築しておく必要があります。リポジトリを複製し、以下のコマンドを実行して必要なイメージを作成してください :

```console
git clone git@github.com:Fiware/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data

./services create
``` 

>**注** `context-provider` イメージはまだ Docker hub にプッシュされていません。続行する前に Docker ソースをビルドできないと、次のエラーが発生します :
>
>```
>Pulling context-provider (fiware/cp-web-app:latest)...
>ERROR: The image for the service you're trying to recreate has been removed.
>```


その後、リポジトリ内で提供される [services](https://github.com/fisuda/tutorials.Time-Series-Data/blob/master/services) Bash スクリプトを実行することによって、コマンドラインからすべてのサービスを初期化することができます :

```console
./services start
``` 

>:information_source: **注:** クリーンアップをやり直したい場合は、次のコマンドを使用して再起動することができます :
>
>```console
>./services stop
>``` 
>

<a name="connecting-fiware-to-a-crate-db-database-via-quantum-leap"></a>
# Quantum Leap を介して Crate-DB データベースに FIWARE を接続

この設定では、**Quantum Leap** は、ポート `8868` 上の NGSI v2 通知を待ち受け、履歴データを **Crate-DB** に永続化します。**Crate-DB** は、ポート `4200` を使用してアクセスでき、直接クエリすることも、Grafana 分析ツールに接続することもできます。コンテキスト・データを提供するシステムの残りの部分は、以前のチュートリアルで説明しています。

<a name="crate-db-database-server-configuration"></a>
## Crate-DB データベース・サーバの設定

```yaml
  crate-db:
    image: crate:1.0.5
    hostname: crate-db
    ports:
      - "4200:4200"
      - "4300:4300"
    command: -Ccluster.name=democluster -Chttp.cors.enabled=true -Chttp.cors.allow-origin="*"
```

<a name="quantum-leap-configuration"></a>
## Quantum Leap の設定

```yaml
  quantum-leap:
    image: smartsdk/quantumleap
    hostname: quantum-leap
    ports:
      - "8668:8668"
    depends_on:
      - crate-db
    environment:
      - CRATE_HOST=crate-db
```

<a name="grafana-configuration"></a>
## Grafana の設定

```yaml
  grafana:
    image: grafana/grafana
    depends_on:
      - crate-db
    ports:
      - "3003:3000"
    environment:
      - GF_INSTALL_PLUGINS=crate-datasource,grafana-clock-panel,grafana-worldmap-panel
```

`quantum-leap` コンテナは、1つのポートで待機しています：

* Quantum Leap のポートの操作 - ポート `8668` サービスは、Orion Context Broker らの通知をリッスンするポートです

The `CRATE_HOST` environment variable defines the location where the data will be persisted.

The `crate-db` container is listening on two ports: 
* The Admin UI is available on port `4200`
* The transport protocol is available on `port 4300`

The `grafana` container has connected up port `3000` internally with port `3003` externally. This is because the Grafana 
UI is usually available on port `3000`, but this port has already been taken by the dummy devices UI so it has been shifted
to another port. The Grafana Environment variables are described within their own 
[documentation](http://docs.grafana.org/installation/configuration/). The configuration ensures we will be able to connect
to the **Crate-DB** database later on in the tutorial

### Generating Context Data

For the purpose of this tutorial, we must be monitoring a system where the context is periodically being updated.
The dummy IoT Sensors can be used to do this. Open the device monitor page at `http://localhost:3000/device/monitor`
and unlock a **Smart Door** and switch on a **Smart Lamp**. This can be done by selecting an appropriate the command 
from the drop down list and pressing the `send` button. The stream of measurements coming from the devices can then
be seen on the same page:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/door-open.gif)


<a name="setting-up-subscriptions"></a>
## Setting up Subscriptions

Once a dynamic context system is up and running, we need to inform **Quantum Leap** directly of changes in context. 
As expected this is done using the subscription mechanism of the **Orion Context Broker**. The `attrsFormat=legacy`
attribute is not required since **Quantum Leap** accepts NGSI v2 notifications directly.

More details about subscriptions can be found in previous tutorials

<a name="aggregate-motion-sensor-count-events"></a>
### Aggregate Motion Sensor Count Events

The rate of change of the **Motion Sensor** is driven by events in the real-world. We need to receive every event to be able to aggregate the results.

This is done by making a POST request to the `/v2/subscription` endpoint of the **Orion Context Broker**.

* The `fiware-service` and `fiware-servicepath` headers are used to filter the subscription to only listen to measurements from the attached IoT Sensors
* The `idPattern` in the request body ensures that **Quantum Leap** will be informed of all **Motion Sensor** data changes.
* The `notification` url must match the exposed port.

The `metadata` attribute ensures that the `time_index` column within the **Crate-DB** database will match the data found
within the **Mongo-DB** database used by the **Orion Context Broker** rather than using the creation time of the record
within the **Crate-DB** itself.

#### :one: リクエスト :

```console
curl -iX POST \
  'http://{{orion}}/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify Quantum Leap of all Motion Sensor count changes",
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
      "url": "http://quantum-leap:8668/v2/notify"
    },
    "attrs": [
      "count"
    ],
    "metadata": ["dateCreated", "dateModified"]
  }
}'
```

<a name="sample-lamp-luminosity"></a>
### Sample Lamp Luminosity

The luminosity of the Smart Lamp is constantly changing, we only need to sample the values to be able to work out relevant statistics such as minimum and maximum values and rates of change.

This is done by making a POST request to the `/v2/subscription` endpoint of the **Orion Context Broker** and including
 the `throttling` attribute in the request body.

* The `fiware-service` and `fiware-servicepath` headers are used to filter the subscription to only listen to measurements from the attached IoT Sensors
* The `idPattern` in the request body ensures that **Quantum Leap** will be informed of all **Motion Sensor** data changes.
* The `notification` url must match the exposed port.
* The `throttling` value defines the rate that changes are sampled.

The `metadata` attribute ensures that the `time_index` column within the **Crate-DB** database will match the data found
within the **Mongo-DB** database used by the **Orion Context Broker** rather than using the creation time of the record
within the **Crate-DB** itself.

#### :two: リクエスト :

```console
curl -iX POST \
  'http://{{orion}}/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify Quantum Leap to sample Lamp changes every five seconds",
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
      "url": "http://quantum-leap:8668/v2/notify"
    },
    "attrs": [
      "luminosity"
    ],
    "metadata": ["dateCreated", "dateModified"]
  },
  "throttling": 5
}'
```

<a name="time-series-data-queries-crate-db"></a>
## Time Series Data Queries (Crate-DB)


**Crate-DB** offers an [HTTP Endpoint](https://crate.io/docs/crate/reference/en/latest/interfaces/http.html) that can be used to submit SQL queries. The endpoint is accessible under `<servername:port>/_sql`.

SQL statements are sent as the body of POST requests in JSON format, where the SQL statement is the value of the `stmt` attribute.

<a name="read-schemas"></a>
### Read Schemas

**Quantum Leap** does not currently offer any interfaces to query for the persisted data A good method to see if data is being persisted is to check to see if a `table_schema` has been created. This can be done by making a request to the **Crate-DB** HTTP endpoint as shown:


#### :three: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' LIMIT 10"}'
```

#### レスポンス :

```json
{
    "cols": ["table_schema"],
    "rows": [
        [ "doc"],
        [ "information_schema"],
        [ "sys"],
        [ "mtopeniot"],
        [ "pg_catalog"]
    ],
    "rowcount": 5,
    "duration": 10.5146
}
```

Schema names are formed with the `mt` prefix followed by `fiware-service` header in lower case. The IoT Agent is forwarding measurements from the dummy IoT devices, with the header `openiot`. These are being persisted under the `mtopeniot` schema.

If the `mtopeniot` does not exist, then the subscription to **Quantum Leap** has not been set up correctly. Check that the subscription exists, and has been configured to send data to the correct location.


<a name="read-tables"></a>
### Read Tables

**Quantum Leap** will persist data into separate tables within the **Crate-DB** database based on the entity type. Table names are formed with the `et` prefix and the entity type name in lowercase.

#### :four: リクエスト :

```console
curl -X POST \
  'http://{{crate}}/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema ='\''mtopeniot'\''"}'
```

#### レスポンス :

```json
{
    "cols": ["table_schema", "table_name"],
    "rows": [
        ["mtopeniot","etmotion"],
        ["mtopeniot","etlamp"]
    ],
    "rowcount": 2,
    "duration": 14.2762
}
```

The response shows that both **Motion Sensor** data and **Smart Lamp** data are being persisted in the database.

<a name="list-the-first-n-sampled-values"></a>
### List the first N Sampled Values

This example shows the first 3 sampled luminosity values from **Lamp:001**.

The SQL statement uses `ORDER BY` and `LIMIT` clauses to sort the data. More details can be found under within the **Crate-DB** [documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :five: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\''  ORDER BY time_index ASC LIMIT 3"}'
```

#### レスポンス :

```json
{
    "cols": ["entity_id","entity_type","fiware_servicepath","luminosity","time_index"
    ],
    "rows": [["Lamp:001","Lamp","/",1750,1530262765000],
        ["Lamp:001","Lamp","/",1507,1530262770000],
        ["Lamp:001","Lamp","/",1390,1530262775000]
    ],
    "rowcount": 3,
    "duration": 21.8338
}
```

<a name="list-n-sampled-values-at-an-offset"></a>
### List N Sampled Values at an Offset

This example shows the fourth, fifth and sixth sampled count values from **Motion:001**.

The SQL statement uses an `OFFSET` clause to retrieve the required rows. More details can be found under within the **Crate-DB** [documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :six: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' LIMIT 10"}'
```

#### レスポンス :

```json
{
    "cols": ["count","entity_id","entity_type","fiware_servicepath","time_index"
    ],
    "rows": [[0,"Motion:001","Motion","/",1530262791452],
        [1,"Motion:001","Motion","/",1530262792469],
        [0,"Motion:001","Motion","/",1530262793472]
    ],
    "rowcount": 3,
    "duration": 54.215
}
```

<a name="list-the-latest-n-sampled-values"></a>
### List the latest N Sampled Values

This example shows latest three sampled count values from **Motion:001**.

The SQL statement uses an `ORDER BY ... DESC` clause combined with a `LIMIT` clause to retrieve the last N rows. More details can be found under within the **Crate-DB** [documentation](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)

#### :seven: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.motion WHERE entity_id = '\''Motion:001'\''  ORDER BY time_index DESC LIMIT 3"}'
```

#### レスポンス :

```json
{
    "cols": ["count","entity_id","entity_type","fiware_servicepath","time_index"
    ],
    "rows": [[0,"Motion:001","Motion","/",1530263896550],
        [1,"Motion:001","Motion","/",1530263894491],
        [0,"Motion:001","Motion","/",1530263892483]
    ],
    "rowcount": 3,
    "duration": 18.591
}
```

<a name="list-the-sum-of-values-over-a-time-period"></a>
### List the Sum of values over a time period

This example shows total count values from **Motion:001** over each minute.

The SQL statement uses a `SUM` function and `GROUP BY` clause to retrieve the relevant data.  **Crate-DB** offers a range of [Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions) to truncate and convert the timestamps into data which can be grouped.

#### :eight: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, SUM (count) AS sum FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' GROUP BY minute"}'
```

#### レスポンス :

```json
{
    "cols": ["minute","sum"],
    "rows": [
        ["2018-06-29T09:17:00.000000Z",12],
        ["2018-06-29T09:34:00.000000Z",10],
        ["2018-06-29T09:08:00.000000Z",11],
        ["2018-06-29T09:40:00.000000Z",3],
        ...etc
    ],
    "rowcount": 42,
    "duration": 22.9832
}
```

<a name="list-the-minimum-values-over-a-time-period"></a>
### List the Minimum Values over a Time Period

This example shows minimum luminosity values from **Lamp:001** over each minute.

The SQL statement uses a `MIN` function and `GROUP BY` clause to retrieve the relevant data.  **Crate-DB** offers a range of [Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions) to truncate and convert the timestamps into data which can be grouped.

#### :nine: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MIN (luminosity) AS min FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### レスポンス :

```json
{
    "cols": ["minute","min"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z",1516],
        ["2018-06-29T09:17:00.000000Z",1831],
        ["2018-06-29T09:40:00.000000Z",1768],
        ["2018-06-29T09:08:00.000000Z",1868],
        ...etc
    ],
    "rowcount": 40,
    "duration": 13.1854
}
```

<a name="list-the-maximum-values-over-a-time-period"></a>
### List the Maximum Values over a Time Period

This example shows maximum luminosity values from **Lamp:001** over each minute.

The SQL statement uses a `MAX` function and `GROUP BY` clause to retrieve the relevant data.  **Crate-DB** offers a range of [Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions) to truncate and convert the timestamps into data which can be grouped.

#### :one::zero: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MAX (luminosity) AS max FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### レスポンス :

```json
{
    "cols": ["minute","max"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z",2008],
        ["2018-06-29T09:17:00.000000Z",1911],
        ["2018-06-29T09:40:00.000000Z",2005],
        ["2018-06-29T09:08:00.000000Z",2008],
        ...etc
    ],
    "rowcount": 43,
    "duration": 26.7215
}
```

<a name="list-the-average-values-over-a-time-period"></a>
### List the Average Values over a Time Period

This example shows the average of luminosity values from **Lamp:001** over each minute.

The SQL statement uses a `AVG` function and `GROUP BY` clause to retrieve the relevant data. **Crate-DB** offers a range of [Date-Time Functions](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions) to truncate and convert the timestamps into data which can be grouped.

#### :one::one: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, AVG (luminosity) AS average FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

#### レスポンス :

```json
{
    "cols": ["minute","average"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z",1874.9],
        ["2018-06-29T09:17:00.000000Z",1867.3333333333333],
        ["2018-06-29T09:40:00.000000Z",1909.7142857142858],
        ["2018-06-29T09:08:00.000000Z",1955.8333333333333],
        ["2018-06-29T09:33:00.000000Z",1933.5],
        ...etc

    ],
    "rowcount": 44,
    "duration": 22.0911
}
```





<a name="next-steps"></a>
# Next Steps

Want to learn how to add more complexity to your application by adding advanced features?
You can find out by reading the other tutorials in this series:

&nbsp; 101. [Getting Started](https://github.com/Fiware/tutorials.Getting-Started)<br/>
&nbsp; 102. [Entity Relationships](https://github.com/Fiware/tutorials.Entity-Relationships)<br/>
&nbsp; 103. [CRUD Operations](https://github.com/Fiware/tutorials.CRUD-Operations)<br/>
&nbsp; 104. [Context Providers](https://github.com/Fiware/tutorials.Context-Providers)<br/>
&nbsp; 105. [Altering the Context Programmatically](https://github.com/Fiware/tutorials.Accessing-Context)<br/> 
&nbsp; 106. [Subscribing to Changes in Context](https://github.com/Fiware/tutorials.Subscriptions)<br/>

&nbsp; 201. [Introduction to IoT Sensors](https://github.com/Fiware/tutorials.IoT-Sensors)<br/>
&nbsp; 202. [Provisioning an IoT Agent](https://github.com/Fiware/tutorials.IoT-Agent)<br/>
&nbsp; 203. [IoT over MQTT](https://github.com/Fiware/tutorials.IoT-over-MQTT)<br/>
&nbsp; 250. [Introduction to Fast-RTPS and Micro-RTPS ](https://github.com/Fiware/tutorials.Fast-RTPS-Micro-RTPS)<br/>

&nbsp; 301. [Persisting Context Data (Mongo-DB, MySQL, PostgreSQL)](https://github.com/Fiware/tutorials.Historic-Context)<br/>
&nbsp; 302. [Querying Time Series Data (Mongo-DB)](https://github.com/Fiware/tutorials.Short-Term-History)<br/>
&nbsp; 303. [Querying Time Series Data (Crate-DB)](https://github.com/Fiware/tutorials.Time-Series-Data)<br/>
