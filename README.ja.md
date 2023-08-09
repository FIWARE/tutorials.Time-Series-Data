# Time-Series-Data (QuantumLeap)[<img src="https://img.shields.io/badge/NGSI-LD-d6604d.svg" width="90"  align="left" />](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.07.01_60/gs_cim009v010701p.pdf)[<img src="https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png" align="left" width="162">](https://www.fiware.org/)<br/>

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://github.com/FIWARE/catalogue/blob/master/core/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Time-Series-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
<br/> [![JSON LD](https://img.shields.io/badge/JSON--LD-1.1-f06f38.svg)](https://w3c.github.io/json-ld-syntax/)
[![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

このチュートリアルは、[FIWARE QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) の概要です。これは、
コンテキスト・データを **CrateDB** データベースに永続化するために使用される汎用イネーブラーです。このチュートリアルは、
[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent)で接続された IoT センサをアクティブにし、それらの
センサからの測定値をデータベースに保持します。このようなデータの時間ベースの集計を取得するには、**QuantumLeap** クエリ
API を使用するか、**CrateDB** HTTP エンドポイントに直接接続します。結果は、グラフまたは **Grafana** 時系列分析ツールを
介して視覚化されます。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、
[Postman documentation](https://fiware.github.io/tutorials.Time-Series-Data/ngsi-ld.html) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/513743-86151708-fb9d-42f2-a2fe-e40b4ea38861?action=collection%2Ffork&collection-url=entityId%3D513743-86151708-fb9d-42f2-a2fe-e40b4ea38861%26entityType%3Dcollection%26workspaceId%3Db6e7fcf4-ff0c-47cb-ada4-e222ddeee5ac)。

## コンテンツ

<details>
<summary><strong>詳細</strong></summary>

-   [時系列データの永続化とクエリ (CrateDB)](#persisting-and-querying-time-series-data-cratedb)
    -   [時系列データの解析](#analyzing-time-series-data)
-   [アーキテクチャ](#architecture)
-   [前提条件](#prerequisites)
    -   [Docker と Docker Compose](#docker-and-docker-compose)
    -   [Cygwin for Windows](#cygwin-for-windows)
-   [起動](#start-up)
-   [QuantumLeap を介して FIWARE を CrateDB データベースに接続](#connecting-fiware-to-a-cratedb-database-via-quantumleap)
    -   [CrateDB データベース・サーバの設定](#cratedb-database-server-configuration)
    -   [QuantumLeap の設定](#quantumleap-configuration)
    -   [Grafana の設定](#grafana-configuration)
        -   [コンテキスト・データの生成](#generating-context-data)
    -   [サブスクリプションのセットアップ](#setting-up-subscriptions)
        -   [充填イベントのアグリゲート](#aggregate-filling-events)
        -   [GPS 測定値 のサンプリング](#sample-gps-readings)
        -   [QuantumLeap のサブスクリプションの確認](#checking-subscriptions-for-quantumleap)
    -   [時系列データ・クエリ (QuantumLeap API)](#time-series-data-queries-quantumleap-api)
        -   [QuantumLeap API - 最初の N 個の サンプリング値のリスト](#quantumleap-api---list-the-first-n-sampled-values)
        -   [QuantumLeap API - N 個のサンプリング値をオフセットでリスト](#quantumleap-api---list-n-sampled-values-at-an-offset)
        -   [QuantumLeap API - 最新のN個のサンプリングされた値のリスト](#quantumleap-api---list-the-latest-n-sampled-values)
        -   [QuantumLeap API - 期間別にグループ化された値の合計をリスト](#quantumleap-api---list-the-sum-of-values-grouped-by-a-time-period)
        -   [QuantumLeap API - 期間別にグループ化された最小値をリスト](#quantumleap-api---list-the-minimum-values-grouped-by-a-time-period)
        -   [QuantumLeap API - ある期間の最大値のリスト](#quantumleap-api---list-the-maximum-value-over-a-time-period)
        -   [QuantumLeap API - ポイント付近のデバイスの最新の N 個のサンプル値をリスト](#quantumleap-api---list-the-latest-n-sampled-values-of-devices-near-a-point)
        -   [QuantumLeap API - エリア内のデバイスの最新の N 個のサンプル値をリスト](#quantumleap-api---list-the-latest-n-sampled-values-of-devices-in-an-area)
    -   [時系列データクエリ (CrateDB API)](#time-series-data-queries-cratedb-api)
        -   [CrateDB API - データの永続性のチェック](#cratedb-api---checking-data-persistence)
        -   [CrateDB API - 最初の N個の サンプリング値のリスト](#cratedb-api---list-the-first-n-sampled-values)
        -   [CrateDB API - N 個のサンプリング値をオフセットでリスト](#cratedb-api---list-n-sampled-values-at-an-offset)
        -   [CrateDB API - 最新の N 個のサンプリングされた値のリスト](#cratedb-api---list-the-latest-n-sampled-values)
        -   [CrateDB API - 期間別にグループ化された値の合計をリスト](#cratedb-api---list-the-sum-of-values-grouped-by-a-time-period)
        -   [CrateDB API - 期間別にグループ化された最小値をリスト](#cratedb-api---list-the-minimum-values-grouped-by-a-time-period)
        -   [CrateDB API - ある期間の最大値のリスト](#cratedb-api---list-the-maximum-value-over-a-time-period)
-   [時系列データへのプログラムによるアクセス](#accessing-time-series-data-programmatically)
    -   [CrateDB データを Grafana ダッシュボードとして表示](#displaying-cratedb-data-as-a-grafana-dashboard)
        -   [ログイン](#logging-in)
        -   [データソースの設定](#configuring-a-data-source)
        -   [ダッシュボードの設定](#configuring-a-dashboard)
-   [次のステップ](#next-steps)

</details>

<a name="persisting-and-querying-time-series-data-cratedb"></a>

# 時系列データの永続化とクエリ (CrateDB)

> "Forever is composed of nows."
>
> — Emily Dickinson

FIWARE [QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) は、時系列データベース (現在は CrateDB および
TimescaleDB) を永続化およびクエリするために特別に作成された時間ベースのデータベース永続化汎用イネーブラーです。
コンポーネントは、NGSI-v2 または NGSI-LD サブスクリプションにレスポンスできます。

[CrateDB](https://crate.io/) は、モノのインターネットで使用するために設計された分散 SQLDBMS です。1秒あたり多数の
データ・ポイントを取り込むことができ、リアルタイムでクエリを実行できます。データベースは、地理空間データや時系列データ
などの複雑なクエリを実行するように設計されています。この履歴コンテキスト・データを取得すると、時間の経過に伴う傾向を
表示するグラフとダッシュボードを作成できます。

[TimescaleDB](https://www.timescale.com/) は、時間と空間にわたる自動パーティショニング (パーティショニング・キー) を
介して時系列データ用に PostgreSQL をスケーリングしますが、標準の PostgreSQL インターフェイスは保持します。言い換えると、
TimescaleDB は通常のテーブルのように見えるものを公開しますが、実際には、実際のデータを構成する多くの個々のテーブルの
抽象化 (または仮想ビュー) にすぎません。[PostGIS](https://postgis.net/) 拡張機能と組み合わせて、geo-timeseries
をサポートできます。

<a name="analyzing-time-series-data"></a>

## 時系列データの解析

時系列データ分析の適切な使用法は、ユースケースと受け取るデータ測定の信頼性によって異なります。時系列データ分析は、
次のような質問に答えるために使用できます:

-   特定の期間内のデバイスの最大測定値はどれくらいでしたか？
-   特定の期間内のデバイスの平均測定値はどれくらいでしたか？
-   特定の期間内にデバイスによって送信された測定値の合計はどれくらいでしたか？

また、平滑化によって外れ値を除外するために、個々のデータポイントの重要性を減らすために使用することもできます。

#### Grafana

[Grafana](https://grafana.com/) は、このチュートリアルで使用される時系列分析ツールのオープンソースソフトウェアです。
**CrateDB** や **TimescaleDB** などのさまざまな時系列データベースと統合されます。Apache License2.0 の下でライセンス
されて利用可能です。詳細については、`https://grafana.com/` をご覧ください。

#### デバイス・モニタ

このチュートリアルの目的のために、一連のダミーの農業用 IoT デバイスが作成され、Context Broker に接続されます。使用
されているアーキテクチャとプロトコルの詳細は、
[IoT センサ・チュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-LD)にあります。各デバイスの
状態は、 UltraLight デバイス・モニタの Web ページは次の場所にあります: `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.Time-Series-Data/img/farm-devices.png)

#### デバイス履歴

**QuantumLeap** がデータの集約を開始すると、各デバイスの履歴状態は、次の場所にあるデバイス履歴 Web ページで
確認できます: `http://localhost:3000/device/history/urn:ngsi-ld:Farm:001`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/history-graphs.png)

<a name="architecture"></a>

# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent/)で作成された
コンポーネントとダミー IoT デバイスに基づいて構築されています。
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/),
[IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/),
[QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/)
の3つのFIWAREコンポーネントを使用します。

したがって、アーキテクチャ全体は次の要素で構成されます:
    -   FIWARE
        [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は、
        [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json)
        を使用してリクエストを受信します
    -   FIWARE
        [IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/)
        は、Ultralight 2.0 形式のダミー IoT デバイスからノース・バウンドの測定値
        を受信し、Context Broker の
        [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json)
        リクエストに変換してコンテキスト・エンティティの状態を変更します
    -   FIWARE [QuantumLeap](https://smartsdk.github.io/ngsi-timeseries-api/) はコンテキストの変更をサブスクライブし、
        **CrateDB** データベースに永続化します

-   [MongoDB](https://www.mongodb.com/) データベース :

    -   **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・
        データ情報を保持するために使用します
    -   デバイスの URLs や Keys などのデバイス情報を保持するために **IoT Agent** によって使用されます

-   [CrateDB](https://crate.io/) データベース：

    -   時間ベースの履歴コンテキスト・データを保持するデータシンクとして使用されます
    -   時間ベースのデータクエリを解釈する HTTP エンドポイントを提供します

-   HTTP **Web-Server** は、システム内のコンテキスト・エンティティを定義する静的な `@context` ファイルを提供します
-   **チュートリアルアプリケーション** は次のことを行います:
    -   HTTP上で実行される [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        プロトコルを使用して、ダミーの[農業用 IoT デバイス](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-LD)
        のセットとして機能します

要素間のすべての相互作用は HTTP リクエストによって開始されるため、エンティティをコンテナ化して、公開されたポートから実行できます。

全体的なアーキテクチャを以下に示します:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/architecture.png)

<a name="prerequisites"></a>

# 前提条件

<a name="docker-and-docker-compose"></a>

## Docker と Docker Compose

物事を単純にするために、両方のコンポーネントが [Docker](https://www.docker.com) を使用して実行されます。**Docker** は、さまざま
コンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

-   Docker Windows にインストールするには、[こちら](https://docs.docker.com/docker-for-windows/)の手順に従ってください
-   Docker Mac にインストールするには、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
-   Docker Linux にインストールするには、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。
[YAML file](https://raw.githubusercontent.com/FIWARE/tutorials.Time-Series-Data/NGSI-LD/docker-compose.yml)
ファイルは、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは 1 つのコマンド
で呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows と Docker for Mac の一部としてインストールされますが、
Linux ユーザは[ここ](https://docs.docker.com/compose/install/)に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます:

```console
docker-compose -v
docker version
```

Docker バージョン 20.10 以降と Docker Compose 1.29 以上を使用していることを確認し、必要に応じてアップグレードしてください。

<a name="cygwin-for-windows"></a>

## Cygwin for Windows

シンプルな bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/) をダウンロードして、
Windows 上の Linux ディストリビューションと同様のコマンドライン機能を提供する必要があります。

<a name="start-up"></a>

# 起動

開始する前に、必要な Docker イメージをローカルで取得または構築しておく必要があります。リポジトリを複製し、
以下のコマンドを実行して必要なイメージを作成してください :

```console
git clone https://github.com/FIWARE/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data
git checkout NGSI-LD

./services create
```

その後、リポジトリ内で提供される
[services](https://github.com/FIWARE/tutorials.Time-Series-Data/blob/NGSI-LD/services)
Bash スクリプトを実行することによって、コマンドラインからすべてのサービスを初期化することができます :

```console
./services [orion|scorpio|stellio]
```
> :information_source: **注:** クリーンアップをやり直したい場合は、次のコマンドを使用して再起動することができます :
>
> ```console
> ./services stop
> ```

<a name="connecting-fiware-to-a-cratedb-database-via-quantumleap"></a>

# QuantumLeap を介して FIWARE を CrateDB データベースに接続

この設定では、**QuantumLeap** は、ポート `8668` 上の NGSI-LD 通知を待ち受け、履歴データを **CrateDB** に永続化します。
**CrateDB** は、ポート `4200` を使用してアクセスでき、直接クエリすることも、Grafana 分析ツールに接続することもできます。
コンテキスト・データを提供するシステムの残りの部分は、以前のチュートリアルで説明しています。

<a name="cratedb-database-server-configuration"></a>

## CrateDB データベース・サーバの設定

```yaml
crate-db:
    image: crate:4.1.4
    hostname: crate-db
    ports:
        - "4200:4200"
        - "4300:4300"
    command:
        crate -Clicense.enterprise=false -Cauth.host_based.enabled=false  -Ccluster.name=democluster
        -Chttp.cors.enabled=true -Chttp.cors.allow-origin="*"
    environment:
        - CRATE_HEAP_SIZE=2g
```

CrateDB が `max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]`
エラーで直ぐに終了する場合、ホストマシンで `sudo sysctl -w vm.max_map_count=262144` コマンドを実行する
ことで修正できます。詳細については、CrateDB の
[ドキュメント](https://crate.io/docs/crate/howtos/en/latest/admin/bootstrap-checks.html#bootstrap-checks)
と、Docker [トラブルシューティング・ガイド](https://crate.io/docs/crate/howtos/en/latest/deployment/containers/docker.html#troubleshooting)
を参照してください。

<a name="quantumleap-configuration"></a>

## QuantumLeap の設定

```yaml
quantumleap:
    image: smartsdk/quantumleap
    hostname: quantumleap
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
        - cratedb
    ports:
        - "3003:3000"
    environment:
        - GF_INSTALL_PLUGINS=https://github.com/orchestracities/grafana-map-plugin/archive/master.zip;grafana-map-plugin,grafana-clock-panel,grafana-worldmap-panel
```

`quantumleap` コンテナは、1つのポートで待機しています:

-   QuantumLeap のポートの操作 - ポート `8668` サービスは、Orion Context Broker からの通知をリッスンするポートで、
    ここからユーザはデータをクエリできます

`CRATE_HOST` 環境変数は、データが永続化される場所を定義します。

`cratedb` コンテナは、2つのポートでリッスンしています：

-   Admin UI は、ポート `4200` で利用できます
-   トランスポートプロトコルは、ポート `4300` で利用できます

`grafana` コンテナは、内部ポート `3000` を外部ポート `3003` に接続しています。これは Grafana UI が通常はポート `3000`
で使用できるためですが、このポートは ダミー IoT デバイスの UI によって既に取得されているため、別のポートに移動しています。
Grafana 環境変数は、Grafana の[ドキュメント](https://grafana.com/docs/installation/configuration/)に記述されています。
この設定により、チュートリアルの後半で **CrateDB** データベースに接続できるようになります。この設定では、NGSI-LD
エンティティをマップ上に表示するのに役立つカスタム・マップ・プラグインもインポートします。

<a name="generating-context-data"></a>

### コンテキスト・データの生成

このチュートリアルでは、コンテキストが定期的に更新されるシステムを監視する必要があります。ダミー IoT センサを使用して
これを行うことができます。

農場周辺のさまざまな建物の詳細は、チュートリアル・アプリケーションにあります。
`http://localhost:3000/app/farm/urn:ngsi-ld:Building:farm001` を開いて、関連する充填センサ (filling sensor) と
サーモスタット (thermostat) を備えた建物を表示します。

![](https://fiware.github.io/tutorials.Subscriptions/img/fmis.png)

納屋から干し草を取り除き、サーモスタットを更新して、`http://localhost:3000/device/monitor` のデバイス・モニタ・ページを
開き、**Filling sensor** を起動して、**Thermostat** をオンにします。これは、ドロップ・ダウン・リストから適切なコマンドを
選択して [Send] ボタンを押すことで実行できます。デバイスからの測定の流れは、同じページに表示されます。

<a name="setting-up-subscriptions"></a>

## サブスクリプションのセットアップ

動的コンテキスト・システムが稼働したら、コンテキストの変更を **QuantumLeap** に直接通知する必要があります。予想どおり、
これは **Orion Context Broker** のサブスクリプション・メカニズムを使用して行われます。

サブスクリプションについては、次のサブセクションで説明します。サブスクリプションの詳細については、以前のチュートリアル
または QuantumLeap ドキュメントの
[サブスクリプション・セクション](https://quantumleap.readthedocs.io/en/latest/user/#orion-subscription) を参照してください。

<a name="aggregate-filling-events"></a>

### 充填イベントのアグリゲート

**Filling Sensor** (充填センサ) の変化率は、実世界のイベントによって決まります。結果を集約 (aggregate) できるようにするには、
すべてのイベントを受信する必要があります。

これは、**Orion-LD Context Broker** の `/ngsi-ld/v1/subscriptions/` エンドポイントに POST リクエストを行うことで実行されます

-   `NGSILD-Tenant` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサからの測定値のみをリッスンするため
    に使用されます
-   リクエスト・ボディの `entities` `type` は、**QuantumLeap**にすべての **FillingLevelSensor** データの変更が通知されるように
    します
-   `notification` URL は公開されたポートと一致する必要があります

NGSI-LD では、`observedAt` _property-of-property_ は測定値のタイムスタンプを保持します。 監視対象の属性にはこの
_property-of-property_ が含まれているため、**CrateDB**データベース内の `time_index` 列は、**CrateDB** 自体の中でレコードの
作成時間を使用するよりも、**Orion Context Broker** によって使用される **MongoDB** データベース内にあるデータと一致します。

#### :one: リクエスト:

```console
curl -L -X POST 'http://localhost:1026/ngsi-ld/v1/subscriptions/' \
-H 'Content-Type: application/ld+json' \
-H 'NGSILD-Tenant: openiot' \
--data-raw '{
  "description": "Notify me of all feedstock changes",
  "type": "Subscription",
  "entities": [{"type": "FillingLevelSensor"}],
  "watchedAttributes": ["filling"],
  "notification": {
    "attributes": ["filling", "location"],
    "format": "normalized",
    "endpoint": {
      "uri": "http://quantumleap:8668/v2/notify",
      "accept": "application/json"
    }
  },
   "@context": "http://context/ngsi-context.jsonld"
}'
```
<a name="sample-gps-readings"></a>

### GPS 測定値 のサンプリング

農場の動物の首輪 (Animal Collars) の心拍数と GPS 読み取り値は絶えず変化しています。最小値と最大値、変化率などの関連する
統計を計算するには、値をサンプリングするだけで済みます。

これは、**Orion Context Broker**の `/ngsi-ld/v1/subscriptions/` エンドポイントに POST リクエストを行い、リクエストの
ボディに `throttling` 属性を含めることで実行されます。

-   `NGSILD-Tenant` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサからの測定値のみをリッスン
    するために使用されます
-   リクエスト・ボディの `entities` `type` は、**QuantumLeap** にすべての **Device** データの変更が通知されるようにします
-   `notification` URL は公開されたポートと一致する必要があります
-   `throttling` 値は、変更がサンプリングされるレートを定義します

#### :two: リクエスト:

```console
curl -L -X POST 'http://localhost:1026/ngsi-ld/v1/subscriptions/' \
-H 'Content-Type: application/ld+json' \
-H 'NGSILD-Tenant: openiot' \
--data-raw '{
  "description": "Notify me of animal locations",
  "type": "Subscription",
  "entities": [{"type": "Device"}],
  "watchedAttributes": ["location", "status", "heartRate"],
  "notification": {
    "attributes": ["location", "status", "heartRate"],
    "format": "normalized",
    "endpoint": {
      "uri": "http://quantumleap:8668/v2/notify",
      "accept": "application/json"
    }
  },
   "throttling": 10,
   "@context": "http://context/ngsi-context.jsonld"
}'
```

<a name="checking-subscriptions-for-quantumleap"></a>

### QuantumLeap のサブスクリプションの確認

何よりもまず、ステップ :one: と :two: で作成したサブスクリプションが機能していることを確認します (つまり、それぞれに
少なくとも1つの通知が送信されました)。

#### :three: リクエスト:

```console
curl -X GET \
  'http://localhost:1026/ngsi-ld/v1/subscriptions/' \
  -H 'NGSILD-Tenant: openiot'
```

#### レスポンス:

```json
[
    {
        "id": "urn:ngsi-ld:Subscription:601157b4bc8ec912978db6e4",
        "type": "Subscription",
        "description": "Notify me of all feedstock changes",
        "entities": [
            {
                "type": "FillingLevelSensor"
            }
        ],
        "watchedAttributes": ["filling"],
        "notification": {
            "attributes": ["filling"],
            "format": "normalized",
            "endpoint": {
                "uri": "http://quantumleap:8668/v2/notify",
                "accept": "application/json"
            }
        },
        "@context": "http://context/ngsi-context.jsonld"
    },
    {
        "id": "urn:ngsi-ld:Subscription:601157e3bc8ec912978db6e5",
        "type": "Subscription",
        "description": "Notify me of animal locations",
        "entities": [
            {
                "type": "Device"
            }
        ],
        "watchedAttributes": ["location", "state", "heartRate"],
        "notification": {
            "attributes": ["location", "state", "heartRate"],
            "format": "normalized",
            "endpoint": {
                "uri": "http://quantumleap:8668/v2/notify",
                "accept": "application/json"
            }
        },
        "throttling": 10,
        "@context": "http://context/ngsi-context.jsonld"
    }
]
```

<a name="time-series-data-queries-quantumleap-api"></a>

## 時系列データ・クエリ (QuantumLeap API)

**QuantumLeap**は CrateDB バックエンドをラップする API を提供するため、複数のタイプのクエリを実行することもできます。
API のドキュメントは[こちら](https://app.swaggerhub.com/apis/smartsdk/ngsi-tsdb/) です。バージョンに注意してください。
`quantumleap` コンテナにアクセスできる場合(たとえば、`localhost` で実行されているか、ポート転送されている場合)、
`http://localhost:8668/v2/ui` を介してその API をナビゲートできます。

<a name="quantumleap-api---list-the-first-n-sampled-values"></a>

### QuantumLeap API - 最初の N 個の サンプリング値のリスト

ここで、QuantumLeap が値を保持していることを確認するために、最初のクエリから始めましょう。この例は、
`urn:ngsi-ld:Device:filling001` からサンプリングされた最初の3つの `filling` 値を示しています。

`NGSILD-Tenant` と同等の NGSI-v2 である `Fiware-Service` ヘッダの使用に注意してください。これらは、そのようなヘッダを
使用してデータが Orion にプッシュされる場合にのみ必要です (マルチテナンシー・シナリオの場合)。これらのヘッダの整合に
失敗すると、データは返されません。

#### :four: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?limit=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": ["2018-10-29T14:27:26", "2018-10-29T14:27:28", "2018-10-29T14:27:29"],
        "values": [0.94, 0.87, 0.84]
    }
}
```

<a name="quantumleap-api---list-n-sampled-values-at-an-offset"></a>

### QuantumLeap API - N 個のサンプリング値をオフセットでリスト

この例は、`urn:ngsi-ld:Device:filling001` の4番目, 5番目, 6番目のサンプルの `filling` 値を示しています。

#### :five: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?offset=3&limit=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": ["2018-10-29T14:23:53.804000", "2018-10-29T14:23:54.812000", "2018-10-29T14:24:00.849000"],
        "values": [0.75, 0.63, 0.91]
    }
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values"></a>

### QuantumLeap API - 最新のN個のサンプリングされた値のリスト

この例は、`urn:ngsi-ld:Device:filling001` からサンプリングされた最新の3つの `filling` 値を示しています。

#### :six: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": ["2018-10-29T15:03:45.113000", "2018-10-29T15:03:46.118000", "2018-10-29T15:03:47.111000"],
        "values": [0.91, 0.67, 0.9]
    }
}
```

<a name="quantumleap-api---list-the-sum-of-values-grouped-by-a-time-period"></a>

### QuantumLeap API - 期間別にグループ化された値の合計をリスト

この例は、1分あたりの `urn:ngsi-ld:Device:filling001` の最後の3つの合計 `filling` 値を示しています。

QuantumLeap **バージョン0.4.1以上** が必要です。次のような簡単な GET でバージョンを確認できます:

```console
curl -X GET \
  'http://localhost:8668/version' \
  -H 'Accept: application/json'
```

#### :seven: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?aggrMethod=count&aggrPeriod=minute&lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": ["2018-10-29T15:03:00.000000"],
        "values": [8]
    }
}
```

<a name="quantumleap-api---list-the-minimum-values-grouped-by-a-time-period"></a>

### QuantumLeap API - 期間別にグループ化された最小値をリスト

この例は、1分ごとの `urn:ngsi-ld:Device:filling001` からの最小の `filling` 値を示しています。

<!--lint disable no-blockquote-without-marker-->

> QuantumLeap **バージョン0.4.1以上** が必要です。次のような簡単な GET でバージョンを確認できます:

> ```console
> curl -X GET \
>   'http://localhost:8668/version' \
>   -H 'Accept: application/json'
> ```

<!--lint enable no-blockquote-without-marker-->

#### :eight: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?aggrMethod=min&aggrPeriod=minute&lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": ["2018-10-29T15:03:00.000000", "2018-10-29T15:04:00.000000", "2018-10-29T15:05:00.000000"],
        "values": [0.63, 0.49, 0.03]
    }
}
```

<a name="quantumleap-api---list-the-maximum-value-over-a-time-period"></a>

### QuantumLeap API - ある期間の最大値のリスト

この例は、`2018-06-27T09:00:00` から `2018-06-30T23:59:59` の間に発生した `urn:ngsi-ld:Device:filling001` の
最大 `filling` 値を示しています。

#### :nine: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/entities/urn:ngsi-ld:Device:filling001/attrs/filling?aggrMethod=max&fromDate=2018-06-27T09:00:00&toDate=2018-06-30T23:59:59' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "filling",
        "entityId": "urn:ngsi-ld:Device:filling001",
        "index": [],
        "values": [0.94]
    }
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values-of-devices-near-a-point"></a>

### QuantumLeap API - ポイント付近のデバイスの最新の N 個のサンプル値をリスト

この例は、`52°31'04.8"N 13°21'25.2"E` (ティーアガルテン, ベルリン, ドイツ) から半径5km以内にある動物の最新の心拍数で
サンプリングされた `heartRate` 値を示しています。いずれかのデバイスをオンにすると、動物はベルリンのティーアガルテンを
歩き回り、デバイス・モニタ・ページで、`urn:ngsi-ld:Device:cow001` と `urn:ngsi-ld:Device:pig001` のデータを
確認できるはずです。

> :information_source: **注:** 地理的クエリは、QuantumLeap のバージョン `0.5` 以上で使用できます。これは、
> [NGSI v2 specification](http://fiware.github.io/specifications/ngsiv2/stable/) の地理的クエリのセクションで詳しく
> 説明されているクエリの完全なセットを実装します。

#### :one::zero: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/types/Device/attrs/heartRate?lastN=4&georel=near;maxDistance:5000&geometry=point&coords=52.518,13.357' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "attrName": "heartRate",
    "entities": [
        {
            "entityId": "urn:ngsi-ld:Device:cow001",
            "index": ["2021-01-27T16:52:05.925+00:00", "2021-01-27T16:52:30.769+00:00"],
            "values": [53, 50]
        },
        {
            "entityId": "urn:ngsi-ld:Device:cow002",
            "index": ["2021-01-27T16:50:50.792+00:00"],
            "values": [53]
        },
        {
            "entityId": "urn:ngsi-ld:Device:cow004",
            "index": ["2021-01-27T16:51:55.798+00:00"],
            "values": [51]
        }
    ],
    "entityType": "Device"
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values-of-devices-in-an-area"></a>

### QuantumLeap API - エリア内のデバイスの最新の N 個のサンプル値をリスト

この例は、`52°33'16.9"N 13°23'55.0"E` (Bornholmer Straße 65, ベルリン, ドイツ) を中心とする一辺200mの正方形の内側にある
充填センサの最新の4つのサンプリングされた `filling` 値を示しています。デバイス・モニタ・ページで使用可能なすべての
充填センサをオンにした場合でも、`urn:ngsi-ld:Device:filling001` のデータのみが表示されます。

> :information_source: **注:** 地理的クエリは、QuantumLeap のバージョン `0.5` 以上で使用できます。これは、
> [NGSI v2 specification](http://fiware.github.io/specifications/ngsiv2/stable/) の地理的クエリのセクションで詳しく
> 説明されているクエリの完全なセットを実装します。

#### :one::one: リクエスト:

```console
curl -X GET \
  'http://localhost:8668/v2/types/Device/attrs/heartRate?lastN=4&georel=coveredBy&geometry=polygon&coords=52.5537,13.3996;52.5557,13.3996;52.5557,13.3976;52.5537,13.3976;52.5537,13.3996' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot'
```

#### レスポンス:

```json
{
    "data": {
        "attrName": "bpm",
        "entities": [
            {
                "entityId": "urn:ngsi-ld:Device:cow001",
                "index": [
                    "2018-12-13T17:08:56.041",
                    "2018-12-13T17:09:55.976",
                    "2018-12-13T17:10:55.907",
                    "2018-12-13T17:11:55.833"
                ],
                "values": [65, 63, 63, 62]
            }
        ],
        "entityType": "Device"
    }
}
```

<a name="time-series-data-queries-cratedb-api"></a>

## 時系列データクエリ (CrateDB API)

**CrateDB** は、SQL クエリの送信に使用できる
[HTTP エンドポイント](https://crate.io/docs/crate/reference/en/latest/interfaces/http.html) を提供します。
エンドポイントには、`<servername:port>/_sql`からアクセスできます。

SQL ステートメントは JSON 形式で POST リクエストのボディとして送信されます。ここで、SQL ステートメントは `stmt`
属性の値です。

> **CrateDB**をいつクエリするか **QuantumLeap**をいつクエリするか。経験則として、次の理由から、常に**QuantumLeap**
> を使用することをお勧めします:
>
> -   あなたの体験は Orion の ような FIWARE NGSI API に近くなります
> -   アプリケーションは、CrateDBの 詳細や QuantumLeap の実装の詳細に関連付けられないため、アプリが変更されたり
>     破損したりする可能性があります
> -   QuantumLeap は他のバックエンドに簡単に拡張でき、アプリは無料で互換性を取得します
> -   デプロイメントが分散している場合、データベースのポートを外部に公開する必要はありません

クエリが **QuantumLeap** でサポートされていないことが確実な場合は、**CrateDB** をクエリする必要があるかもしれませんが、
[QuantumLeap の GitHub リポジトリ](https://github.com/orchestracities/ngsi-timeseries-api/issues)に Issue
をあげてください。開発チームが認識します。

<a name="cratedb-api---checking-data-persistence"></a>

### CrateDB API - データの永続性のチェック

データが永続化されているかどうかを確認するもう1つの方法は、`table_schema` が作成されているかどうかを確認することです。
これは、次のように **CrateDB** HTTP エンドポイントにリクエストを送信することで実行できます:

#### :one::two: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW SCHEMAS"}'
```

#### レスポンス:

```json
{
    "cols": ["schema_name"],
    "rows": [["blob"], ["doc"], ["information_schema"], ["mtopeniot"], ["pg_catalog"], ["sys"]],
    "rowcount": 6,
    "duration": 20.3418
}
```

スキーマ名は、`mt` プレフィックスとそれに続く小文字の `NGSILD-Tenant` ヘッダで形成されます。IoT Agent は、
`NGSILD-Tenant` ヘッダ `openiot` を使用して、ダミー IoT デバイスから測定値を転送しています。これらは `mtopeniot`
スキーマの下で永続化されています。

`mtopeniot` が存在しない場合、**QuantumLeap** へのサブスクリプションは正しく設定されていません。サブスクリプションが
存在し、正しい場所にデータを送信するように構成されていることを確認してください。

**QuantumLeap**は、エンティティ・タイプに基づいて、**CrateDB**データベース内の個別のテーブルにデータを永続化します。
テーブル名は、プレフィックス `et` とエンティティ・タイプ名を小文字で使用して構成されます。

#### :one::three: リクエスト:

```console
curl -X POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW TABLES"}'
```

#### レスポンス:

```json
{
    "cols": ["table_schema", "table_name"],
    "rows": [
        ["mtopeniot", "etFillingLevelSensor"],
        ["mtopeniot", "etdevice"]
    ],
    "rowcount": 3,
    "duration": 14.2762
}
```

レスポンスは、**Filling Sensor** データと **Animal Collar Device** データの両方がデータベースに保持されていることを
示しています。

<a name="cratedb-api---list-the-first-n-sampled-values"></a>

### CrateDB API - 最初の N個の サンプリング値のリスト

SQL ステートメントは、 `ORDERBY` 句 と `LIMIT` 句を使用してデータを並べ替えます。詳細については、**CrateDB**
[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)をご覧ください。

#### :one::four: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\'' ORDER BY time_index ASC LIMIT 3"}'
```

#### レスポンス:

```json
{
    "cols": ["entity_id", "entity_type", "fiware_servicepath", "filling", "time_index"],
    "rows": [
        ["urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 0.87, 1530262765000],
        ["urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 0.65, 1530262770000],
        ["urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 0.6, 1530262775000]
    ],
    "rowcount": 3,
    "duration": 21.8338
}
```

<a name="cratedb-api---list-n-sampled-values-at-an-offset"></a>

### CrateDB API - N 個のサンプリング値をオフセットでリスト

SQL ステートメントは、`OFFSET` 句を使用して必要な行 (rows) を取得します。詳細については、**CrateDB**
[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)をご覧ください。

#### :one::five: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\'' order by time_index ASC LIMIT 3 OFFSET 3"}'
```

#### レスポンス:

```json
{
    "cols": ["filling", "entity_id", "entity_type", "fiware_servicepath", "time_index"],
    "rows": [
        [0.75, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530262791452],
        [0.63, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530262792469],
        [0.5, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530262793472]
    ],
    "rowcount": 3,
    "duration": 54.215
}
```

<a name="cratedb-api---list-the-latest-n-sampled-values"></a>

### CrateDB API - 最新の N 個のサンプリングされた値のリスト

SQL ステートメントは、`ORDER BY ... DESC` 句を `LIMIT` 句と組み合わせて使用して、最後の N 行 (N rows) を取得します。
詳細については、**CrateDB**
[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)をご覧ください。

#### :one::six: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\''  ORDER BY time_index DESC LIMIT 3"}'
```

#### レスポンス:

```json
{
    "cols": ["filling", "entity_id", "entity_type", "fiware_servicepath", "time_index"],
    "rows": [
        [0.51, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530263896550],
        [0.43, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530263894491],
        [0.4, "urn:ngsi-ld:Device:filling001", "FillingLevelSensor", "/", 1530263892483]
    ],
    "rowcount": 3,
    "duration": 18.591
}
```

<a name="cratedb-api---list-the-sum-of-values-grouped-by-a-time-period"></a>

### CrateDB API - 期間別にグループ化された値の合計をリスト

SQL ステートメントは、`SUM` 関数と `GROUPBY` 句を使用して関連データを取得します。**CrateDB**は、さまざまな
[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
(Date-Time Functions) を提供します。タイムスタンプを切り捨てて、グループ化できるデータに変換します。

#### :one::seven: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, SUM (filling) AS sum FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\'' GROUP BY minute LIMIT 3"}'
```

#### レスポンス:

```json
{
    "cols": ["minute", "sum"],
    "rows": [
        ["2018-06-29T09:17:00.000000Z", 4.37],
        ["2018-06-29T09:34:00.000000Z", 6.23],
        ["2018-06-29T09:08:00.000000Z", 6.51],
        ["2018-06-29T09:40:00.000000Z", 3],
        ...etc
    ],
    "rowcount": 42,
    "duration": 22.9832
}
```

<a name="cratedb-api---list-the-minimum-values-grouped-by-a-time-period"></a>

### CrateDB API - 期間別にグループ化された最小値をリスト

SQL ステートメントは、`MIN` 関数と `GROUPBY` 句を使用して関連データを取得します。**CrateDB**は、さまざまな
[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)
(Date-Time Functions) を提供します。タイムスタンプを切り捨てて、グループ化できるデータに変換します。

#### :one::eight: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MIN (filling) AS min FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\'' GROUP BY minute"}'
```

#### レスポンス:

```json
{
    "cols": ["minute", "min"],
    "rows": [
        ["2018-06-29T09:34:00.000000Z", 0.5],
        ["2018-06-29T09:17:00.000000Z", 0.04],
        ["2018-06-29T09:40:00.000000Z", 0.33],
        ["2018-06-29T09:08:00.000000Z", 0.44],
        ...etc
    ],
    "rowcount": 40,
    "duration": 13.1854
}
```

<a name="cratedb-api---list-the-maximum-value-over-a-time-period"></a>

### CrateDB API - ある期間の最大値のリスト

SQL ステートメントは、`MAX` 関数と `WHERE` 句を使用して関連データを取得します。**CrateDB**は、さまざまな方法でデータを
集約するためのさまざまな
[集約関数](https://crate.io/docs/crate/reference/en/latest/general/dql/selects.html#data-aggregation)
(Aggregate Functions) を提供します。

#### :one::nine: リクエスト:

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT MAX(filling) AS max FROM mtopeniot.etFillingLevelSensor WHERE entity_id = '\''urn:ngsi-ld:Device:filling001'\'' and time_index >= '\''2018-06-27T09:00:00'\'' and time_index < '\''2018-06-30T23:59:59'\''"}'
```

#### レスポンス:

```json
{
    "cols": ["max"],
    "rows": [[1]],
    "rowcount": 1,
    "duration": 26.7215
}
```
<a name="accessing-time-series-data-programmatically"></a>

# 時系列データへのプログラムによるアクセス

指定された時系列の JSON レスポンスが取得されると、生データを表示することはエンドユーザにとってほとんど役に
立たちません。これは、棒グラフ、折れ線グラフ、またはテーブル・リストに表示するために操作する必要があります。
これは、グラフィカルなツールではないため、**QuantumLeap** のドメイン内にはありませんが、
[WireCloud](https://github.com/FIWARE/catalogue/blob/master/processing/README.md#Wirecloud)
や
[Knowage](https://github.com/FIWARE/catalogue/blob/master/processing/README.md#Knowage)
などのマッシュアップやダッシュボード・コンポーネントに任せることができます。

また、コーディング環境に適したサード・パーティのグラフ作成ツール ([chartjs](http://www.chartjs.org/) など) を使用して、
検索して表示することもできます。この例は、
[Git Repository](https://github.com/FIWARE/tutorials.Step-by-Step/blob/master/context-provider/controllers/history.js)
の `history` コントローラ内にあります。

基本的な処理は、検索と属性マッピングの 2 つのステップで構成されています。サンプルコードは以下のとおりです:

```javascript
function readCrateSensorfilling(id, aggMethod) {
    return new Promise(function (resolve, reject) {
        const sqlStatement =
            "SELECT DATE_FORMAT (DATE_TRUNC ('minute', time_index)) AS minute, " +
            aggMethod +
            "(filling) AS " +
            aggMethod +
            " FROM mtopeniot.etFillingLevelSensor WHERE entity_id = 'urn:ngsi-ld:Device:" +
            id +
            "' GROUP BY minute ORDER BY minute";
        const options = {
            method: "POST",
            url: crateUrl,
            headers: { "Content-Type": "application/json" },
            body: { stmt: sqlStatement },
            json: true,
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
        _.forEach(crateResponse.rows, (element) => {
            const date = moment(element[0]);
            data.push({ t: date, y: element[1] });
            labels.push(date.format("HH:mm"));
            color.push(hexColor);
        });
    }

    return {
        labels,
        data,
        color,
    };
}
```

変更されたデータはフロントエンドに渡され、サードパーティのグラフ作成ツールで処理されます。結果を次に示します:
`http://localhost:3000/device/history/urn:ngsi-ld:Farm:001`.

<a name="displaying-cratedb-data-as-a-grafana-dashboard"></a>

## CrateDB データを Grafana ダッシュボードとして表示

**CrateDB** は、QuantumLeap の時系列データ・シンクとして選択されています。
[他の多くのメリット](https://quantumleap.readthedocs.io/en/latest/)の中でも、[Grafana](https://grafana.com/)
時系列分析ツールとシームレスに統合されています。Grafana を使用して、アグリゲートされたセンサ・データを表示することが
できます。[ここ](https://www.youtube.com/watch?v=sKNZMtoSHN4)でダッシュボードを構築するための完全なチュートリアルを
見つけることができます。次の簡単な手順では、充填センサの `filling` データのグラフを接続して表示する方法を
まとめています。

<a name="logging-in"></a>

### ログイン

`docker-compose` ファイルは Grafana UI のインスタンスをポート `3003` でリッスンしているので、ログイン・ページは
次の場所にあります: `http://localhost:3003/login`。デフォルトのユーザー名は `admin` で、デフォルトのパスワードは
`admin` です。

<a name="configuring-a-data-source"></a>

### データソースの設定

ログイン後、PostgreSQL のデータソースは、`http://localhost:3003/datasources` において、次の値で設定する必要があります:

-   **Name** `CrateDB`
-   **Host** `crate-db:5432`
-   **Database** `mtopeniot`
-   **User** `crate`
-   **SSL Mode** `disable`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-crate-connect.png)

Save and test ボタンをクリックし、_Database Connection OK_ と表示されていることを確認します。

<a name="configuring-a-dashboard"></a>

### ダッシュボードの設定

新しいダッシュボードを表示するには、**+** ボタンをクリックして **Dashboard** を選択するか、直接
`http://localhost:3003/dashboard/new?orgId=1` にアクセスします。その後、**Add Query** をクリックします。

**太字のテキスト**の次の値は、グラフ作成ウィザードに配置する必要があります:

-   Queries to **CrateDB** (以前に作成したデータソースから選択)
-   FROM **etFillingLevelSensor**
-   Time column **time_index**
-   Metric column **entity_id**
-   Select value **column:filling**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-graph.png)

次に、キーボードの `ESC` をクリックすると、作成したグラフを含むダッシュボードが表示されます。

`Add Panel` ボタンをクリックして `Choose Visualisation` を選択し、`Map panel` を選択します。

マップ・レイアウト・オプションで、次の値を設定します:

-   Center: **custom**
-   Latitude: **52.5031**
-   Longitude: **13.4447**
-   Initial Zoom: **12**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-1.png)

左側の `Queries` タブをクリックして、次のように設定します:

-   Format as: **Table**
-   FROM **etFillingLevelSensor**
-   Time column **time_index**
-   Metric column **entity_id**
-   Select value
    -   **column:filling** **alias:value**
    -   **column:location** **alias:geojson**
    -   **column:entity_type** **alias:type**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-2.png)

左側の `Visualisation` タブをクリックして、次のように設定します:

-   Map Layers:
    -   FillingLevelSensor:
        -   Icon: **lightbulb-o**
        -   ClusterType: **average**
        -   ColorType: **fix**
        -   Column for value: **value**
        -   Maker color: **red**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-3.png)

最終結果は以下の通りです:

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-result.png)

# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか？このシリーズの
[他のチュートリアル](https://www.letsfiware.jp/ngsi-ld-tutorials/)
を読むことで見つけることができます

---

## License

[MIT](LICENSE) © 2018-2023 FIWARE Foundation e.V.
