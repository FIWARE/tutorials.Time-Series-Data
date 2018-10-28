[![FIWARE Banner](https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png)](https://www.fiware.org/developers)

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://www.fiware.org/developers/catalogue/)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Time-Series-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://nexus.lab.fiware.org/repository/raw/public/badges/stackoverflow/fiware.svg)](https://stackoverflow.com/questions/tagged/fiware)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-blue.svg)](https://fiware-ges.github.io/core.Orion/api/v2/stable/)
<br/>
[![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

このチュートリアルでは、コンテキスト・データを **CrateDB** データベースに保存するために使用される、Generic Enabler である [FIWARE QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) について紹介します。このチュートリアルでは、[以前のチュートリアル](https://github.com/Fiware/tutorials.IoT-Agent)で接続した IoT センサを有効にし、それらのセンサからの測定値をデータベースに保存します。**CrateDB** HTTP エンドポイントは、そのデータの時間ベースの集計を取得するために使用されます。結果は、グラフまたは **Grafana** 時系列分析ツールを介して視覚化されます。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、[Postman documentation](https://fiware.github.io/tutorials.Time-Series-Data/) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d24facc3c430bb5d5aaf)

# 内容

- [時系列データの永続化とクエリ (CrateDB)](#persisting-and-querying-time-series-data-cratedb)
  * [時系列データの解析](#analyzing-time-series-data)
- [アーキテクチャ](#architecture)
- [前提条件](#prerequisites)
  * [Docker と Docker Compose](#docker-and-docker-compose)
  * [Cygwin for Windows](#cygwin-for-windows)
- [起動](#start-up)
- [QuantumLeap を介して FIWARE を CrateDB データベースに接続](#connecting-fiware-to-a-cratedb-database-via-quantumleap)
  * [CrateDB データベース・サーバの設定](#cratedb-database-server-configuration)
  * [QuantumLeap の設定](#quantumleap-configuration)
  * [Grafana の設定](#grafana-configuration)
  * [サブスクリプションのセットアップ](#setting-up-subscriptions)
    + [モーション・センサのカウント・イベントの集計](#aggregate-motion-sensor-count-events)
    + [ランプの明度のサンプリング](#sample-lamp-luminosity)
  * [時系列データクエリ (CrateDB)](#time-series-data-queries-cratedb)
    + [スキーマの読み込み](#read-schemas)
    + [テーブルの読み込み](#read-tables)
    + [最初の N 個のサンプリング値をリスト](#list-the-first-n-sampled-values)
    + [オフセットで N 個のサンプリングされた値をリスト](#list-n-sampled-values-at-an-offset)
    + [最新の N 個のサンプリング値をリスト](#list-the-latest-n-sampled-values)
    + [一定期間にわたる値の合計をリスト](#list-the-sum-of-values-over-a-time-period)
    + [一定期間にわたる値の最小値をリスト](#list-the-minimum-values-over-a-time-period)
    + [一定期間にわたる値の最大値をリスト](#list-the-maximum-values-over-a-time-period)
    + [一定期間にわたる値の平均値をリスト](#list-the-average-values-over-a-time-period)
- [プログラミングによる時系列データへのアクセス](#accessing-time-series-data-programmatically)
  * [CrateDB データを Grafana Dashboard として表示](#displaying-cratedb-data-as-a-grafana-dashboard)
    + [ログイン](#logging-in)
    + [データソースの設定](#configuring-a-data-source)
    + [ダッシュボードの設定](#configuring-a-dashboard)
- [次のステップ](#next-steps)

<a name="persisting-and-querying-time-series-data-cratedb"></a>
# 時系列データの永続化とクエリ (CrateDB)

> "Forever is composed of nows."
>
> — Emily Dickinson

[以前のチュートリアル](https://github.com/Fiware/tutorials.Historic-Context)では、履歴コンテキスト・データを MySQL や PostgreSQL などのデータベースに永続化する方法を示しました。さらに、[Short Term Historic](https://github.com/Fiware/tutorials.Short-Term-History) のチュートリアルでは、**MongoDB** データベースを使用して履歴コンテキスト・データを永続化およびクエリするための [STH-Comet](https://fiware-sth-comet.readthedocs.io/) Generic Enabler を導入しました。

FIWARE [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) は、**CrateDB** 時系列データベースへのデータ永続性のために特別に作成された代替 Generic Enabler であり、[STH-Comet](https://fiware-sth-comet.readthedocs.io/) に代わるものです。

[CrateDB](https://crate.io/) は、Internet of Things で使用するために設計された分散 SQL DBMS です。1秒間に多数のデータ・ポイントを取り込むことができ、リアルタイムでクエリすることができます。このデータベースは、地理空間データや時系列データなどの複雑なクエリの実行用に設計されています。この履歴データを取得することで、グラフやダッシュボードを作成し、時間の経過とともに傾向を表示することができます。

違いの概要を以下に示します :

| QuantumLeap               | STH-Comet |
|----------------------------|-----------|
| 通知のための NGSI v2 インタフェースを提供します | 通知のための NGSI v1 インタフェースを提供します |
| データを CrateDB データベースに保存します  | データを MongoDB データベースに保存します |
| クエリ 用に独自の HTTP エンドポイントを提供しません。CrateDB SQL エンドポイント を使用します | クエリ用に独自の HTTP エンドポイントを提供します。MongoDB データベースに直接アクセスすることはできません |
| CrateDB SQL エンドポイントは、SQL を使用して複雑なデータクエリを満たすことができます | STH-Comet は限定された一連のクエリを提供していますs |
| CrateDBは、NoSQL ストレージの上に構築された分散 SQL DBMS です | MongoDB は、ドキュメント・ベースの NoSQL データベースです |

基盤となるデータベースエンジンの相違点の詳細は、[こちら](https://db-engines.com/en/system/CrateDB%3BMongoDB)を参照してください。

<a name="analyzing-time-series-data"></a>
## 時系列データの解析

時系列データ分析を適切に使用するかどうかは、ユースケースと受け取るデータ測定の信頼性によって異なります。時系列データ分析を使用すると、次のような質問に答えることができます。

* 一定期間内のデバイスの最大測定値はどれくらいでしたか？
* 一定期間内のデバイスの平均測定値はどれくらいでしたか？
* 一定期間内にデバイスから送信された測定値の合計はどれくらいですか？

また、個々のデータポイントの重要性を減らして、スムージングによって外れ値を除外するために使用することもできます。


#### Grafana

[Grafana](https://grafana.com/) は、このチュートリアルで使用する時系列解析ツール用のオープンソースソフトウェアです。これは、**CrateDB** を含む様々な時系列データベースと統合されています。Apache License 2.0 のライセンスで利用可能です。詳細は、https://grafana.com/ をご覧ください。


#### デバイス・モニタ

このチュートリアルの目的のために、一連のダミー IoT デバイスが作成され、Context Broker に接続されます。使用しているアーキテクチャとプロトコルの詳細は、[IoT Sensors チュートリアル](https://github.com/Fiware/tutorials.IoT-Sensors)にあります。各デバイスの状態は、次の UltraLight デバイス・モニタの Web ページで確認できます : `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.Time-Series-Data/img/device-monitor.png)

#### デバイス履歴

**QuantumLeap** がデータの集計を開始すると、各デバイスの履歴の状態は、デバイス履歴の Web ページに表示されます : `http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/history-graphs.png)


<a name="architecture"></a>
# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/Fiware/tutorials.IoT-Agent/) で作成したコンポーネントとダミー IoT デバイスをベースにしています。[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)，[IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) および [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) の 3つの FIWARE コンポーネントを使用します。

したがって、全体的なアーキテクチャは次の要素で構成されます :

* **FIWARE Generic Enablers** :
  * FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は、[NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
  * FIWARE [IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) は、Ultralight 2.0 形式のダミー IoT デバイスからノース・バウンドの測定値を受信し、Context Broker の [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) リクエストに変換してコンテキスト・エンティティの状態を変更します
  * FIWARE [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) はコンテキストの変更をサブスクライブし、**CrateDB** データベースに永続化します
* [MongoDB](https://www.mongodb.com/) データベース :
  * **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・データ情報を保持するために使用します
  * デバイスの URLs や Keys などのデバイス情報を保持するために **IoT Agent** によって使用されます
* [CrateDB](https://crate.io/) データベース：
  * 時間ベースの履歴コンテキスト・データを保持するデータシンクとして使用されます
  * 時間ベースのデータクエリを解釈する HTTP エンドポイントを提供します
* 3つの**コンテキストプロバイダ** :
  * **在庫管理フロントエンド**は、このチュートリアルで使用していません。これは以下を行います :
     + 店舗情報を表示し、ユーザーがダミー IoT デバイスと対話できるようにします
     + 各店舗で購入できる商品を表示します
     + ユーザが製品を購入して在庫数を減らすことを許可します
  * HTTP 上で動作する [Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) プロトコルを使用して、[ダミー IoT デバイス](https://github.com/Fiware/tutorials.IoT-Sensors)のセットとして機能する Web サーバ
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

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。[YAML file](https://raw.githubusercontent.com/Fiware/tutorials.Time-Series-Data/master/docker-compose.yml) ファイルは、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは1つのコマンドで呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows とDocker for Mac の一部としてインストールされますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます :

```console
docker-compose -v
docker version
```

Docker バージョン 18.03 以降と Docker Compose 1.21 以上を使用していることを確認し、必要に応じてアップグレードしてください。

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

<a name="connecting-fiware-to-a-cratedb-database-via-quantumleap"></a>
# QuantumLeap を介して FIWARE を CrateDB データベースに接続

この設定では、**QuantumLeap** は、ポート `8868` 上の NGSI v2 通知を待ち受け、履歴データを **CrateDB** に永続化します。**CrateDB** は、ポート `4200` を使用してアクセスでき、直接クエリすることも、Grafana 分析ツールに接続することもできます。コンテキスト・データを提供するシステムの残りの部分は、以前のチュートリアルで説明しています。

<a name="cratedb-database-server-configuration"></a>
## CrateDB データベース・サーバの設定

```yaml
  cratedb:
    image: crate:2.3
    hostname: cratedb
    ports:
      - "4200:4200"
      - "4300:4300"
    command: -Ccluster.name=democluster -Chttp.cors.enabled=true -Chttp.cors.allow-origin="*"
```

<a name="quantumleap-configuration"></a>
## QuantumLeap の設定

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

<a name="grafana-configuration"></a>
## Grafana の設定

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

`quantumleap` コンテナは、1つのポートで待機しています：

* QuantumLeap のポートの操作 - ポート `8668` サービスは、Orion Context Broker からの通知をリッスンするポートです

`CRATE_HOST` 環境変数は、データが永続化される場所を定義します。

`cratedb` コンテナは、2つのポートでリッスンしています：

* Admin UI は、ポート `4200` で利用できます
* トランスポートプロトコルは、ポート `4300` で利用できます

`grafana` コンテナは、内部ポート `3000` を外部ポート `3003` に接続しています。これは Grafana UI が通常はポート `3000` で使用できるためですが、このポートは ダミー IoT デバイスの UI によって既に取得されているため、別のポートに移動しています。Grafana 環境変数は、Grafana の[ドキュメント](http://docs.grafana.org/installation/configuration/)に記述されています。この設定により、チュートリアルの後半で **CrateDB** データベースに接続できるようになります。

### コンテキスト・データの生成

このチュートリアルでは、コンテキストが定期的に更新されるシステムを監視する必要があります。ダミー IoT センサを使用してこれを行うことができます。`http://localhost:3000/device/monitor` でデバイス・モニタのページを開き、**スマート・ドア**のロックを解除し、**スマート・ランプ**をオンにします。これは、ドロップ・ダウン・リストから適切なコマンドを選択し、`send` ボタンを押すことによって行うことができます。デバイスからの測定の流れは、同じページに表示されます :

![](https://fiware.github.io/tutorials.Time-Series-Data/img/door-open.gif)


<a name="setting-up-subscriptions"></a>
## サブスクリプションのセットアップ

動的コンテキスト・システムが起動したら、コンテキストの変更を直接 **QuantumLeap** に通知する必要があります。予想通り、これは **Orion Context Broker** のサブスクリプション・メカニズムを使用して行われます。**QuantumLeap** は、NGSI v2 通知を直接受け入れるため、`attrsFormat=legacy ` 属性は不要です。

サブスクリプションに関する詳細は、以前のチュートリアルで確認できます。

<a name="aggregate-motion-sensor-count-events"></a>
### モーション・センサのカウント・イベントの集計

**モーション・センサ**の変化率は、現実世界の事象によって引き起こされます。結果を集約するためには、すべてのイベントを受け取る必要があります。

これは、**Orion Context Broker** の `/v2/subscription` エンドポイントに POST リクエストをすることで行われます。

* `fiware-service` と `fiware-servicepath` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサからの測定値のみをリッスンためにするために使用されます
* リクエストのボディの `idPattern` は、すべての**モーション・センサ**のデータ変更を **QuantumLeap** に通知されるようにします
* `notification` url は、公開されたポートと一致する必要があります

`metadata` 属性により、**CrateDB** データベース内の `time_index` 列が、**CrateDB** 自体のレコードの作成時間を使用するのではなく、**Orion Context Broker** が使用する **MongoDB** データベース内のデータと一致することが保証されます。

#### :one: リクエスト :

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

<a name="sample-lamp-luminosity"></a>
### ランプの明度のサンプリング

**スマート・ランプ**の明るさは常に変化していますので、最小値や最大値、変化率などの関連する統計値を計算するために値を**サンプリング**するだけです。

これは、**Orion Context Broker** の `/v2/subscription` エンドポイントに POST リクエストを行い、リクエストのボディに `throttling` 属性 を含めることによって行われます。

* `fiware-service` と `fiware-servicepath` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサからの測定値のみをリッスンためにするために使用されます
* リクエストのボディの `idPattern` は、すべての**モーション・センサ**のデータ変更を **QuantumLeap** に通知されるようにします
* `notification` url は、公開されたポートと一致する必要があります
* `throttling` 値は、変更がサンプリングされる割合を定義します

`metadata` 属性により、**CrateDB** データベース内の `time_index` 列が、**CrateDB** 自体のレコードの作成時間を使用するのではなく、**Orion Context Broker** が使用する **MongoDB** データベース内のデータと一致することが保証されます。

#### :two: リクエスト :

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

<a name="time-series-data-queries-cratedb"></a>
## 時系列データクエリ (CrateDB)

**CrateDB** は、SQL クエリを送信するために使用できる [HTTP エンドポイント](https://crate.io/docs/crate/reference/en/latest/interfaces/http.html)を提供します。エンドポイントは、`<servername:port>/_sql` 下でアクセス可能です。

SQL ステートメントは POST リクエストの本体として JSON 形式で送信されます。ここで、SQL ステートメントは `stmt` 属性の値です。

<a name="read-schemas"></a>
### スキーマの読み込み

**QuantumLeap** は、現在、永続化されたデータをクエリするためのインタフェースを提供していません。データが永続化されているかどうかを確認するには、`table_schema` が作成されているかどうかを確認するのが良い方法です。これは、以下のように **CrateDB** HTTP エンドポイントにリクエストを行うことで実行できます :

#### :three: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW SCHEMAS"}'
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

スキーマ名は、`mt` プレフィックスとそれに続く、小文字の `fiware-service` ヘッダで構成されます。IoT Agent は、ヘッダ `openiot` を使用して、ダミー IoT デバイスから測定値を転送します。これらは `mtopeniot` スキーマの下に保持されています。

`mtopeniot` が存在しない場合は、**QuantumLeap** のサブスクリプションが正しく設定されていません。サブスクリプションが存在し、データを正しい場所に送信するように設定されていることを確認します。

<a name="read-tables"></a>
### テーブルの読み込み

**QuantumLeap** は、エンティティ型に基づいて **CrateDB** データベース内の別のテーブルにデータを永続化します。テーブル名は、`et` プレフィックスとエンティティ型の名前を小文字にして形成されます。

#### :four: リクエスト :

```console
curl -X POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW TABLES"}'
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

レスポンスは、**モーション・センサ**のデータと**スマート・ランプ**のデータの両方がデータベースに保持されていることを示します。

<a name="list-the-first-n-sampled-values"></a>
### 最初の N 個のサンプリング値をリスト

この例では、**Lamp:001** の最初の3つのサンプリングされた明度値を示しています。

SQL 文は `ORDER BY` と `LIMIT` を使用してデータをソートします。詳細は、**CrateDB** の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してください。

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
### オフセットで N 個のサンプリングされた値をリスト

この例では、**Motion:001** からのサンプリングされた4番目、5番目、6番目のカウント値を示しています。

SQL 文は、`OFFSET` 句を使用して必要な行を取り出します。詳細は、**CrateDB** の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してください。

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
### 最新の N 個のサンプリング値をリスト

この例では、**Motion:001** から最新の3つのサンプリングされたカウント値を示しています。

SQL 文は、最後の N 行を取り出すために `LIMIT` 節と結合された、`ORDER BY ... DESC` 節を使用します。詳細は、**CrateDB**の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してください。

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
### 一定期間にわたる値の合計をリスト

この例では、1分ごとに **Motion:001** からの合計カウント値を示しています。

SQL 文は、`SUM` 関数と `GROUP BY` 句を使用して関連するデータを取得します。 **CrateDB** は、タイムスタンプを切り捨ててグループ化できるデータに変換するための一連の[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供しています。

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
### 一定期間にわたる値の最小値をリスト

この例は、1分ごとに **Lamp:001** からの最小の明度値を示しています。

SQL 文は、`MIN` 関数と `GROUP BY` 句を使用して関連するデータを取得します。 **CrateDB** は、タイムスタンプを切り捨ててグループ化できるデータに変換するための一連の[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供しています。

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
### 一定期間にわたる値の最大値をリスト

この例は、1分ごとに **Lamp:001** からの最大の明度値を示しています。

SQL 文は、`MAX`関数と `GROUP BY` 句を使用して関連するデータを取得します。**CrateDB** は、タイムスタンプを切り捨ててグループ化できるデータに変換するための一連の[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供しています。

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
### 一定期間にわたる値の平均値をリスト

この例では、1分ごとに **Lamp:001** からの明度値の平均を示しています。

SQL 文は、`AVG` 関数と `GROUP BY` 句を使用して関連するデータを取得します。**CrateDB** は、タイムスタンプを切り捨ててグループ化できるデータに変換するための一連の[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供しています。

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

<a name="accessing-time-series-data-programmatically"></a>
# プログラミングによる時系列データへのアクセス

指定された時系列の JSON レスポンスが取得されると、生のデータを表示することはエンドユーザにとってほとんど役に立たちません。これは、棒グラフ、折れ線グラフ、またはテーブル・リストに表示するために操作する必要があります。これは、グラフィカルなツールではないため、**QuantumLeap** のドメイン内にはありませんが、[Wirecloud](https://github.com/Fiware/catalogue/blob/master/processing/README.md#Wirecloud) や [Knowage](https://catalogue-server.fiware.org/enablers/data-visualization-knowage) などのマッシュアップやダッシュボード・コンポーネントに任せることができます。

また、コーディング環境に適したサード・パーティのグラフ作成ツール ([chartjs](http://www.chartjs.org/) など) を使用して、検索して表示することもできます。この例は、[Git Repository](https://github.com/Fiware/tutorials.Step-by-Step/blob/master/docker/context-provider/express-app/controllers/history.js) の `history` コントローラ内にあります。

基本的な処理は、検索と属性マッピングの2つのステップで構成されています。サンプルコードは以下のとおりです :

```javascript
function readCrateLampLuminosity(id, aggMethod){
    return new Promise(function(resolve, reject) {
    const sqlStatement = 'SELECT DATE_FORMAT (DATE_TRUNC (\'minute\', time_index)) AS minute, ' +
           aggMethod + '(luminosity) AS '+  aggMethod +
           ' FROM mtopeniot.etlamp WHERE entity_id = \'Lamp:' + id +
           '\' GROUP BY minute ORDER BY minute';
    const options = { method: 'POST',
        url: crateUrl,
        headers:
         { 'Content-Type': 'application/json' },
        body: { stmt: sqlStatement },
        json: true };
      request(options, (error, response, body) => {
          return error ? reject(error) : resolve(body);
      });
    });
}
```

```javascript
function crateToTimeSeries(crateResponse, aggMethod, hexColor){

  const data = [];
  const labels = [];
  const color =  [];

  if(crateResponse && crateResponse.rows && crateResponse.rows.length > 0 ){
      _.forEach( crateResponse.rows, element => {
          const date = moment(element[0]);
          data.push({ t: date, y: element[1] });
          labels.push(date.format( 'HH:mm'));
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

変更されたデータは、フロント・エンドに渡され、サード・パーティのグラフ作成ツールによって処理されます。結果は次のとおりです : `http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

<a name="displaying-cratedb-data-as-a-grafana-dashboard"></a>
## CrateDB データを Grafana Dashboard として表示

[Grafana](https://grafana.com/) 時系列分析ツールとシームレスに統合されるため、**CrateDB** は時系列データシンクとして選択されています。Grafana を使用して集計されたセンサ・データを表示することができます。[ここ](https://www.youtube.com/watch?v=sKNZMtoSHN4)でダッシュボードを構築するための完全なチュートリアルを見つけることができます。次の簡単な手順では、ランプの `luminosity` データのグラフを接続して表示する方法をまとめています。

<a name="logging-in"></a>
### ログイン

`docker-compose` ファイルは Grafana UI のインスタンスをポート `3003` でリッスンしているので、ログイン・ページは次の場所にあります: `http://localhost:3003/login`。デフォルトのユーザー名は `admin` で、デフォルトのパスワードは `admin` です。

<a name="configuring-a-data-source"></a>
### データソースの設定

ログイン後、データソースは、`http://localhost:3003/datasources` において、次の値で設定する必要があります：

* **Name**  Lamp
* **Type**  Crate

* **URL**   `http://cratedb:4200`
* **Access** Server (デフォルト)

* **Schema** mtopeniot
* **Table**  etlamp
* **Time column** time_index

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-settings.png)

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-crate-connect.png)

Save をクリックすると、*Data Source added* メッセージが返されますj

<a name="configuring-a-dashboard"></a>
### ダッシュボードの設定

新しいダッシュボードを表示するには、**+** ボタンをクリックして **New Dashboard** を選択するか、直接 `http://localhost:3003/dashboard/new?orgId=1` に移動します。その後、**Graph** ダッシュボード・タイプを選択します。

ダッシュボードを設定するには、Panel title をクリックし、ドロップ・ダウンリストから edit を選択します。

**太字のテキスト**の次の値は、グラフ作成ウィザードに配置する必要があります :
The following values in **bold text** need to be placed in the graphing wizard

* Data Source **Lamp** (以前に作成したデータソースから選択)
* FROM **mtopeniot.etlamp** WHERE **entity_id** = **Lamp:001**
* Select **Min**  **luminosity**
* Group By time Interval **Minute** Format as **Time Series**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-graph.png)

最終結果は以下の通りです :

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-result.png)


<a name="next-steps"></a>
# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか？このシリーズの[他のチュートリアル](https://www.letsfiware.jp/fiware-tutorials)を読むことで見つけることができます

---

## License

[MIT](LICENSE) © FIWARE Foundation e.V.
