[![FIWARE Banner](https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png)](https://www.fiware.org/developers)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://github.com/FIWARE/catalogue/blob/master/core/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Time-Series-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
<br/> [![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

<!-- prettier-ignore -->
このチュートリアルでは、コンテキスト・データを **CrateDB** データベースに保存す
るために使用される、Generic Enabler である
[FIWARE QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) について紹
介します。このチュートリアルでは
、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent)で接続し
た IoT センサを有効にし、それらのセンサからの測定値をデータベースに保存します。
このようなデータの時間ベースの集計を取得するには、**QuantumLeap** クエリAPIを
使用するか、**CrateDB** HTTP エンドポイントに直接接続します。
結果は、グラフまたは **Grafana** 時系列分析ツールを介して視覚化されます。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、
[Postman documentation](https://fiware.github.io/tutorials.Time-Series-Data/) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d24facc3c430bb5d5aaf)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/FIWARE/tutorials.Time-Series-Data/tree/NGSI-v2)

## コンテンツ

<details>
<summary>詳細 <b>(クリックして拡大)</b></summary>

-   [時系列データの永続化とクエリ (CrateDB)](#persisting-and-querying-time-series-data-cratedb)
    -   [時系列データの解析](#analyzing-time-series-data)
        -   [Grafana](#grafana)
        -   [デバイス・モニタ](#device-monitor)
        -   [デバイス・ヒストリ](#device-history)
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
        -   [モーション・センサのカウント・イベントのアグリゲート](#aggregate-motion-sensor-count-events)
        -   [ランプの明度のサンプリング](#sample-lamp-luminosity)
        -   [QuantumLeap のサブスクリプションの確認](#checking-subscriptions-for-quantumleap)
    -   [時系列データ・クエリ (QuantumLeap API)](#time-series-data-queries-quantumleap-api)
        -   [QuantumLeap API - 最初の N 個の サンプリング値のリスト](#quantumleap-api---list-the-first-n-sampled-values)
        -   [QuantumLeap API - N 個のサンプリング値をオフセットでリスト](#quantumleap-api---list-n-sampled-values-at-an-offset)
        -   [QuantumLeap API - 最新の N 個のサンプリングされた値のリスト](#quantumleap-api---list-the-latest-n-sampled-values)
        -   [QuantumLeap API - 期間別にグループ化された値の合計をリスト](#quantumleap-api---list-the-sum-of-values-grouped-by-a-time-period)
        -   [QuantumLeap API - 期間別にグループ化された最小値をリスト](#quantumleap-api---list-the-minimum-values-grouped-by-a-time-period)
        -   [QuantumLeap API - ある期間の最大値のリスト](#quantumleap-api---list-the-maximum-value-over-a-time-period)
        -   [QuantumLeap API - ポイント付近のデバイスの最新の N 個のサンプル値をリスト](#quantumleap-api---list-the-latest-n-sampled-values-of-devices-near-a-point)
        -   [QuantumLeap API - エリア内のデバイスの最新の N 個のサンプル値をリスト](#quantumleap-api---list-the-latest-n-sampled-values-of-devices-in-an-area)
    -   [時系列データ・クエリ (CrateDB API)](#time-series-data-queries-cratedb-api)
        -   [CrateDB API - データの永続性のチェック](#cratedb-api---checking-data-persistence)
        -   [CrateDB API - 最初の N 個の サンプリング値のリスト](#cratedb-api---list-the-first-n-sampled-values)
        -   [CrateDB API - N 個のサンプリング値をオフセットでリスト](#cratedb-api---list-n-sampled-values-at-an-offset)
        -   [CrateDB API - 最新の N 個のサンプリングされた値のリスト](#cratedb-api---list-the-latest-n-sampled-values)
        -   [CrateDB API - 期間別にグループ化された値の合計をリスト](#cratedb-api---list-the-sum-of-values-grouped-by-a-time-period)
        -   [CrateDB API - 期間別にグループ化された最小値をリスト](#cratedb-api---list-the-minimum-values-grouped-by-a-time-period)
        -   [CrateDB API - ある期間の最大値のリスト](#cratedb-api---list-the-maximum-value-over-a-time-period)
-   [プログラミングによる時系列データへのアクセス](#accessing-time-series-data-programmatically)
    -   [CrateDB データを Grafana Dashboard として表示](#displaying-cratedb-data-as-a-grafana-dashboard)
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

[以前のチュートリアル](https://github.com/FIWARE/tutorials.Historic-Context-Flume)では、履歴コンテキスト・データを MySQL
や PostgreSQL などのデータベースに永続化する方法を示しました。さらに
、[Short Term Historic](https://github.com/FIWARE/tutorials.Short-Term-History) のチュートリアルでは、**MongoDB** データ
ベースを使用して履歴コンテキスト・データを永続化およびクエリするための
[STH-Comet](https://fiware-sth-comet.readthedocs.io/) Generic Enabler を導入しました。

FIWARE [QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) は、永続化および時系列データベース (現在の CrateDB
および TimescaleDB) をクエリする API を提供するために特別に作成された代替 Generic Enabler です。したがって、
[STH-Comet](https://fiware-sth-comet.readthedocs.io/) の代替手段を提供します。

[CrateDB](https://crate.io/) は、Internet of Things で使用するために設計された分散 SQL DBMS です。1 秒間に多数のデータ・
ポイントを取り込むことができ、リアルタイムでクエリすることができます。このデータベースは、地理空間データや時系列データな
どの複雑なクエリの実行用に設計されています。この履歴データを取得することで、グラフやダッシュボードを作成し、時間の経過と
ともに傾向を表示することができます。

[TimescaleDB](https://www.timescale.com/) は、時系列データの PostgreSQL を、時空間全体の自動パーティション分割 (パーティ
ション・キー) でスケーリングしますが、標準の PostgreSQL インターフェイスを保持します。つまり、TimescaleDB は通常のテーブ
ルのように見えるものを公開しますが、実際には、実際のデータを構成する多くの個々のテーブルの抽象化または仮想ビューにすぎま
せん。 [TimescaleDB](https://www.timescale.com/) 拡張機能と組み合わせて、 geo-timeseries をサポートできます。

違いの概要を以下に示します :

| QuantumLeap                                                                                                                    | STH-Comet                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 通知のための NGSI v2 インタフェースを提供します                                                                                | 通知のための NGSI v1 インタフェースを提供します                                                             |
| データを CrateDB および TimescaleDB database データベースに保存します                                                          | データを MongoDB データベースに保存します                                                                   |
| クエリ用に独自の HTTP エンドポイント (現在は CrateDB 用) を提供しますが、CrateDB および TimescaleDB にクエリすることもできます | クエリ用に独自の HTTP エンドポイントを提供します。MongoDB データベースに直接アクセスすることはできません    |
| QuantumLeap は複雑なデータクエリを提供します (CrateDB および TimescaleDB のおかげで)                                           | STH-Comet は限定された一連のクエリを提供しています                                                          |
| QuantumLeap は、2 つのネイティブ分散およびスケーラブルな SQL DBMS を活用します                                                 | MongoDB は、ドキュメント・ベースの NoSQL データベースです                                                   |
| QuantumLeap の API は、[ここ](https://app.swaggerhub.com/apis/smartsdk/ngsi-tsdb)にある OpenAPI でドキュメント化されています   | STH-Comet は、[ここ](https://fiware-sth-comet.readthedocs.io/en/latest)にあるドキュメントで説明されています |

基盤となるデータベース・エンジンの相違点の詳細は
、[こちら](https://db-engines.com/en/system/CrateDB%3BMongoDB%3BTimescaleDB)を参照してください。

<a name="analyzing-time-series-data"></a>

## 時系列データの解析

時系列データ分析を適切に使用するかどうかは、ユースケースと受け取るデータ測定の信頼性によって異なります。時系列データ分析
を使用すると、次のような質問に答えることができます。

-   一定期間内のデバイスの最大測定値はどれくらいでしたか？
-   一定期間内のデバイスの平均測定値はどれくらいでしたか？
-   一定期間内にデバイスから送信された測定値の合計はどれくらいですか？

また、個々のデータポイントの重要性を減らして、スムージングによって外れ値を除外するために使用することもできます。

#### Grafana

[Grafana](https://grafana.com/) は、このチュートリアルで使用する時系列解析ツール用のオープンソースソフトウェアです。これ
は、**CrateDB** および **TimescaleDB** を含むさまざまな時系列データベースと統合します。Apache License 2.0 の下でライセン
スされています。詳細については、`https://grafana.com/` を参照してください。

<a name="device-monitor"></a>

#### デバイス・モニタ

このチュートリアルの目的のために、一連のダミー IoT デバイスが作成され、Context Broker に接続されます。使用しているアーキ
テクチャとプロトコルの詳細は
、[IoT Sensors チュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2)にあります。各デバイスの状態
は、次の UltraLight デバイス・モニタの Web ページで確認できます : `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.Time-Series-Data/img/device-monitor.png)

<a name="device-history"></a>

#### デバイス履歴

**QuantumLeap** がデータの集計を開始すると、各デバイスの履歴の状態は、デバイス履歴の Web ページに表示されます :
`http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/history-graphs.png)

<a name="architecture"></a>

# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent/) で作成したコンポーネント
とダミー IoT デバイスをベースにしています
。[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)，[IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/)
および [QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) の 3 つの FIWARE コンポーネントを使用します。

したがって、全体的なアーキテクチャは次の要素で構成されます :

-   **FIWARE Generic Enablers** :

    -   FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は
        、[NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
    -   FIWARE [IoT Agent for Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) は、Ultralight 2.0
        形式のダミー IoT デバイスからノース・バウンドの測定値を受信し、Context Broker の
        [NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2) リクエストに変換してコンテキスト・エンティティ
        の状態を変更します
    -   FIWARE [QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) はコンテキストの変更をサブスクライブし
        、**CrateDB** データベースに永続化します

-   [MongoDB](https://www.mongodb.com/) データベース :

    -   **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・デ
        ータ情報を保持するために使用します
    -   デバイスの URLs や Keys などのデバイス情報を保持するために **IoT Agent** によって使用されます

-   [CrateDB](https://crate.io/) データベース：

    -   時間ベースの履歴コンテキスト・データを保持するデータシンクとして使用されます
    -   時間ベースのデータクエリを解釈する HTTP エンドポイントを提供します

-   **コンテキストプロバイダ** : - HTTP 上で動作する
    [Ultralight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
    プロトコルを使用して、 [ダミー IoT デバイス](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2)のセットと
    して機能する Web サーバです。 - このチュートリアルでは、 **コンテキスト・プロバイダの NGSI proxy** は使用しません

要素間のすべての対話は HTTP リクエストによって開始されるため、エンティティはコンテナ化され、公開されたポートから実行され
ます。

全体的なアーキテクチャを以下に示します :

![](https://fiware.github.io/tutorials.Time-Series-Data/img/architecture.png)

<a name="prerequisites"></a>

# 前提条件

<a name="docker-and-docker-compose"></a>

## Docker と Docker Compose

物事を単純にするために、両方のコンポーネントが [Docker](https://www.docker.com) を使用して実行されます。**Docker** は、
さまざまコンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

-   Docker Windows にインストールするには、[こちら](https://docs.docker.com/docker-for-windows/)の手順に従ってください
-   Docker Mac にインストールするには、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
-   Docker Linux にインストールするには、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです
。[YAML file](https://raw.githubusercontent.com/FIWARE/tutorials.Time-Series-Data/NGSI-v2/docker-compose.yml) ファイルは
、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは 1 つのコマンド
で呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows と Docker for Mac の一部としてインストール
されますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます :

```console
docker-compose -v
docker version
```

Docker バージョン 20.10 以降と Docker Compose 1.29 以上を使用していることを確認し、必要に応じてアップグレードしてくださ
い。

<a name="cygwin-for-windows"></a>

## Cygwin for Windows

シンプルな bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/) をダウンロー
ドして、Windows 上の Linux ディストリビューションと同様のコマンドライン機能を提供する必要があります。

<a name="start-up"></a>

# 起動

開始する前に、必要な Docker イメージをローカルで取得または構築しておく必要があります。リポジトリを複製し、以下のコマンド
を実行して必要なイメージを作成してください :

```console
git clone https://github.com/FIWARE/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data
git checkout NGSI-v2

./services create
```

その後、リポジトリ内で提供される [services](https://github.com/FIWARE/tutorials.Time-Series-Data/blob/NGSI-v2/services)
Bash スクリプトを実行することによって、コマンドラインからすべてのサービスを初期化することができます :

```console
./services start
```

> :information_source: **注:** クリーンアップをやり直したい場合は、次のコマンドを使用して再起動することができます :
>
> ```console
> ./services stop
> ```

<a name="connecting-fiware-to-a-cratedb-database-via-quantumleap"></a>

# QuantumLeap を介して FIWARE を CrateDB データベースに接続

この設定では、**QuantumLeap** は、ポート `8668` 上の NGSI v2 通知を待ち受け、履歴データを **CrateDB** に永続化します
。**CrateDB** は、ポート `4200` を使用してアクセスでき、直接クエリすることも、Grafana 分析ツールに接続することもできます
。コンテキスト・データを提供するシステムの残りの部分は、以前のチュートリアルで説明しています。

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
        crate -Cauth.host_based.enabled=false  -Ccluster.name=democluster -Chttp.cors.enabled=true
        -Chttp.cors.allow-origin="*"
    environment:
        - CRATE_HEAP_SIZE=2g
```

CrateDB が `max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]` エラーで直ぐに
終了する場合、ホストマシンで `sudo sysctl -w vm.max_map_count=262144` コマンドを実行することで修正できます。詳細について
は、CrateDB の [ドキュメント](https://crate.io/docs/crate/howtos/en/latest/admin/bootstrap-checks.html#bootstrap-checks)
と、Docker
[トラブルシューティング・ガイド](https://crate.io/docs/crate/howtos/en/latest/deployment/containers/docker.html#troubleshooting)
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
        - GF_INSTALL_PLUGINS=orchestracities-map-panel,grafana-clock-panel,grafana-worldmap-panel
```

`quantumleap` コンテナは、1 つのポートで待機しています：

-   QuantumLeap のポートの操作 - ポート `8668` サービスは、Orion Context Broker からの通知をリッスンするポートで、ここか
    らユーザはデータをクエリできます。

`CRATE_HOST` 環境変数は、データが永続化される場所を定義します。

`cratedb` コンテナは、2 つのポートでリッスンしています：

-   Admin UI は、ポート `4200` で利用できます
-   トランスポートプロトコルは、ポート `4300` で利用できます

`grafana` コンテナは、内部ポート `3000` を外部ポート `3003` に接続しています。これは Grafana UI が通常はポート `3000` で
使用できるためですが、このポートは ダミー IoT デバイスの UI によって既に取得されているため、別のポートに移動しています
。Grafana 環境変数は、Grafana の[ドキュメント](https://grafana.com/docs/installation/configuration/)に記述されています。
この設定により、チュートリアルの後半で **CrateDB** データベースに接続できるようになります。この設定では、NGSI v2 エンテ
ィティをマップ上に表示するのに役立つカスタム・マップ・プラグインもインポートします。

<a name="generating-context-data"></a>

### コンテキスト・データの生成

このチュートリアルでは、コンテキストが定期的に更新されるシステムを監視する必要があります。ダミー IoT センサを使用してこ
れを行うことができます。`http://localhost:3000/device/monitor` でデバイス・モニタのページを開き、**スマート・ドア**のロ
ックを解除し、**スマート・ランプ**をオンにします。これは、ドロップ・ダウン・リストから適切なコマンドを選択し、`send` ボ
タンを押すことによって行うことができます。デバイスからの測定の流れは、同じページに表示されます :

![](https://fiware.github.io/tutorials.IoT-Sensors/img/door-open.gif)

<a name="setting-up-subscriptions"></a>

## サブスクリプションのセットアップ

動的コンテキスト・システムが起動したら、コンテキストの変更を直接 **QuantumLeap** に通知する必要があります。予想通り、こ
れは **Orion Context Broker** のサブスクリプション・メカニズムを使用して行われます。**QuantumLeap** は、NGSI v2 通知を直
接受け入れるため、`attrsFormat=legacy` 属性は不要です。

サブスクリプションについては、次のサブセクションで説明します。サブスクリプションの詳細については、以前のチュートリアルや
QuantumLeap のドキュメントの
[サブスクリプション・セクション](https://quantumleap.readthedocs.io/en/latest/user/#orion-subscription) を参照してくださ
い。

<a name="aggregate-motion-sensor-count-events"></a>

### モーション・センサのカウント・イベントの集計

**モーション・センサ**の変化率は、現実世界の事象によって引き起こされます。結果を集約するためには、すべてのイベントを受け
取る必要があります。

これは、**Orion Context Broker** の `/v2/subscription` エンドポイントに POST リクエストをすることで行われます。

-   `fiware-service` と `fiware-servicepath` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサから
    の測定値のみをリッスンためにするために使用されます
-   リクエストのボディの `idPattern` は、すべての**モーション・センサ**のデータ変更を **QuantumLeap** に通知されるように
    します
-   `notification` URL は、公開されたポートと一致する必要があります

`metadata` 属性により、**CrateDB** データベース内の `time_index` 列が、**CrateDB** 自体のレコードの作成時間を使用するの
ではなく、**Orion Context Broker** が使用する **MongoDB** データベース内のデータと一致することが保証されます。

<a name="one-request"></a>

#### :one: リクエスト :

```console
curl -iX POST \
  'http://localhost:1026/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify QuantumLeap of count changes of any Motion Sensor",
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
  },
  "throttling": 1
}'
```

<a name="sample-lamp-luminosity"></a>

### ランプの明度のサンプリング

**スマート・ランプ**の明るさは常に変化していますので、最小値や最大値、変化率などの関連する統計値を計算するために値を**サ
ンプリング**するだけです。

これは、**Orion Context Broker** の `/v2/subscription` エンドポイントに POST リクエストを行い、リクエストのボディに
`throttling` 属性 を含めることによって行われます。

-   `fiware-service` と `fiware-servicepath` ヘッダは、サブスクリプションをフィルタリングして、接続された IoT センサから
    の測定値のみをリッスンためにするために使用されます
-   リクエストのボディの `idPattern` は、すべての**モーション・センサ**のデータ変更を **QuantumLeap** に通知されるように
    します
-   `notification` URL は、公開されたポートと一致する必要があります
-   `throttling` 値は、変更がサンプリングされる割合を定義します

`metadata` 属性により、**CrateDB** データベース内の `time_index` 列が、**CrateDB** 自体のレコードの作成時間を使用するの
ではなく、**Orion Context Broker** が使用する **MongoDB** データベース内のデータと一致することが保証されます。

<a name="two-request"></a>

#### :two: リクエスト :

```console
curl -iX POST \
  'http://localhost:1026/v2/subscriptions/' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "description": "Notify QuantumLeap on luminosity changes on any Lamp",
  "subject": {
    "entities": [
      {
        "idPattern": "Lamp.*"
      }
    ],
    "condition": {
      "attrs": [
        "luminosity",
        "location"
      ]
    }
  },
  "notification": {
    "http": {
      "url": "http://quantumleap:8668/v2/notify"
    },
    "attrs": [
      "luminosity", "location"
    ],
    "metadata": ["dateCreated", "dateModified"]
  },
  "throttling": 1
}'
```

<a name="checking-subscriptions-for-quantumleap"></a>

### QuantumLeap のサブスクリプションの確認

何かをする前に、:one: と :two: のステップで作成したサブスクリプションをチェックしてください (すなわち、それぞれが少なく
とも 1 つの通知が送信されたか)

<a name="three-request"></a>

#### :three: リクエスト:

```console
curl -X GET \
  'http://localhost:1026/v2/subscriptions/' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

<a name="response"></a>

#### レスポンス:

```json
[
    {
        "id": "5be07427be9a2d09cf677f08",
        "description": "Notify QuantumLeap of count changes of any Motion Sensor",
        "status": "active",
        "subject": { ...ETC },
        "notification": {
            "timesSent": 6,
            "lastNotification": "2018-09-02T08:36:04.00Z",
            "attrs": ["count"],
            "attrsFormat": "normalized",
            "http": { "url": "http://quantumleap:8668/v2/notify" },
            "lastSuccess": "2018-09-02T08:36:04.00Z"
        },
        "throttling": 1
    },
    {
        "id": "5be07427be9a2d09cf677f09",
        "description": "Notify QuantumLeap on luminosity changes on any Lamp",
        "status": "active",
        "subject": { ...ETC },
        "notification": {
            "timesSent": 4,
            "lastNotification": "2018-09-02T08:36:00.00Z",
            "attrs": ["luminosity"],
            "attrsFormat": "normalized",
            "http": { "url": "http://quantumleap:8668/v2/notify" },
            "lastSuccess": "2018-09-02T08:36:01.00Z"
        },
        "throttling": 1
    }
]
```

<a name="time-series-data-queries-quantumleap-api"></a>

## 時系列データ・クエリ (QuantumLeap API)

**QuantumLeap**は、CrateDB バックエンドをラッピングする API を提供し、複数のタイプのクエリを実行することもできます。API
のドキュメントは [こちら](https://app.swaggerhub.com/apis/smartsdk/ngsi-tsdb/)です。バージョンに注意してください
。`quantumleap` コンテナへのアクセス権がある場合 (例えば、`localhost` で実行中、またはポート・フォワーディングしている
)、 `http://localhost:8668/v2/ui` を介して API をナビゲートできます。

<a name="quantumleap-api---list-the-first-n-sampled-values"></a>

### QuantumLeap API - 最初の N 個の サンプリング値のリスト

さて、QuantumLeap が永続的な値であることを確認するために、最初のクエリを始めましょう。この例は、`Lamp:001` から、最初に
サンプリングされた 3 つの `luminosity` 値を示しています。

`Fiware-Service` と `Fiware-ServicePath` ヘッダの使用に注意してください。これらは、マルチテナント・シナリオでこのような
ヘッダを使用してデータを強制的にプッシュする場合にのみ必要です。これらのヘッダを追加しないと、データが返されません。

<a name="four-request"></a>

#### :four: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Lamp:001/attrs/luminosity?limit=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-1"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "luminosity",
        "entityId": "Lamp:001",
        "index": [
            "2018-10-29T14:27:26",
            "2018-10-29T14:27:28",
            "2018-10-29T14:27:29"
        ],
        "index": ["2018-10-29T14:27:26", "2018-10-29T14:27:28", "2018-10-29T14:27:29
        "values": [2000, 1991, 1998]
    }
}
```

<a name="quantumleap-api---list-n-sampled-values-at-an-offset"></a>

### QuantumLeap API - N 個のサンプリング値をオフセットでリスト

この例は、`Motion:001` の 4 番目、5 番目および 6 番目のサンプリングされた `count` 値を示しています。

<a name="five-request"></a>

#### :five: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Motion:001/attrs/count?offset=3&limit=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-2"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "count",
        "entityId": "Motion:001",
        "index": ["2018-10-29T14:23:53.804000", "2018-10-29T14:23:54.812000", "2018-10-29T14:24:00.849000"],
        "index": ["2018-10-29T14:23:53.804000", "2018-10-29T14:23:54.812000", "2018-10-29T14:24:00.849000"],
        "values": [0, 1, 0]
    }
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values"></a>

### QuantumLeap API - 最新の N 個のサンプリングされた値のリスト

この例は、`Motion:001` の最新の 3 個のサンプリングされた `count` 値を示しています。

<a name="six-request"></a>

#### :six: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Motion:001/attrs/count?lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-3"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "count",
        "entityId": "Motion:001",
        "index": ["2018-10-29T15:03:45.113000", "2018-10-29T15:03:46.118000", "2018-10-29T15:03:47.111000"],
        "index": ["2018-10-29T15:03:45.113000", "2018-10-29T15:03:46.118000", "2018-10-29T15:03:47.111000"],
        "values": [1, 0, 1]
    }
}
```

<a name="quantumleap-api---list-the-sum-of-values-grouped-by-a-time-period"></a>

### QuantumLeap API - 期間別にグループ化された値の合計をリスト

この例では、`Motion:001` の 1 分ごとの最後の 3 個の合計 `count` 値を示しています。

QuantumLeap **バージョン >= 0.4.1** 以上が必要です。次のような単純な GET でバージョンを確認することができます :

```console
curl -X GET \
  'http://localhost:8668/version' \
  -H 'Accept: application/json'
```

<a name="seven-request"></a>

#### :seven: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Motion:001/attrs/count?aggrMethod=count&aggrPeriod=minute&lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-4"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "count",
        "entityId": "Motion:001",
        "index": ["2018-10-29T15:03:00.000000", "2018-10-29T15:04:00.000000", "2018-10-29T15:05:00.000000"],
        "index": ["2018-10-29T15:03:00.000000", "2018-10-29T15:04:00.000000", "2018-10-29T15:05:00.000000"],
        "values": [21, 10, 11]
    }
}
```

<a name="quantumleap-api---list-the-minimum-values-grouped-by-a-time-period"></a>

### QuantumLeap API - 期間別にグループ化された最小値をリスト

この例では、1 分ごとの `Lamp:001` からの最小 `luminosity` 値を示しています。

<!--lint disable no-blockquote-without-marker-->

> QuantumLeap **バージョン >= 0.4.1** 以上が必要です。次のような単純な GET でバージョンを確認することができます :

> ```console
> curl -X GET \
>   'http://localhost:8668/version' \
>   -H 'Accept: application/json'
> ```

<!--lint enable no-blockquote-without-marker-->

<a name="eight-request"></a>

#### :eight: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Lamp:001/attrs/luminosity?aggrMethod=min&aggrPeriod=minute&lastN=3' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-5"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "count",
        "entityId": "Motion:001",
        "index": ["2018-10-29T15:03:00.000000", "2018-10-29T15:04:00.000000", "2018-10-29T15:05:00.000000"],
        "index": ["2018-10-29T15:03:00.000000", "2018-10-29T15:04:00.000000", "2018-10-29T15:05:00.000000"],
        "values": [1720, 1878, 1443]
    }
}
```

<a name="quantumleap-api---list-the-maximum-value-over-a-time-period"></a>

### QuantumLeap API - ある期間の最大値のリスト

この例では、`2018-06-27T09:00:00` から `2018-06-30T23:59:59` までの間に発生した、`Lamp:001` の最大の `luminosity` 値を示
しています。

<a name="nine-request"></a>

#### :nine: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/entities/Lamp:001/attrs/luminosity?aggrMethod=max&fromDate=2018-06-27T09:00:00&toDate=2018-06-30T23:59:59' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-6"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "luminosity",
        "entityId": "Lamp:001",
        "index": [],
        "values": [1753]
    }
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values-of-devices-near-a-point"></a>

### QuantumLeap API - ポイント付近のデバイスの最新の N 個のサンプル値をリスト

この例は、 `52°33'16.9"N 13°23'55.0"E` (Bornholmer Straße 65, Berlin, Germany) から半径 5km 以内にある最新の４つのサンプ
リングされたランプの `luminosity` 値を示しています。デバイス・モニタのページで利用可能なすべてのランプをつけると、
`Lamp:001` と `Lamp:004` のデータを見ることができるはずです。

> :information_source: **注:** 地理的クエリは、 [NGSI v2 仕様](http://fiware.github.io/specifications/ngsiv2/stable/) の
> 地理的クエリのセクションに詳述されている完全なクエリのセットを実装する、 QuantumLeap のバージョン `0.5` からのみ利用可
> 能です。

<a name="onezero-request"></a>

#### :one::zero: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/types/Lamp/attrs/luminosity?lastN=4&georel=near;maxDistance:5000&geometry=point&coords=52.5547,13.3986' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-7"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "luminosity",
        "entities": [
            {
                "entityId": "Lamp:001",
                "index": ["2018-12-13T16:35:58.284", "2018-12-13T16:36:58.216"],
                "values": [999, 999]
            },
            {
                "entityId": "Lamp:004",
                "index": ["2018-12-13T16:35:04.351", "2018-12-13T16:36:04.282"],
                "values": [948, 948]
            }
        ],
        "entityType": "Lamp"
    }
}
```

<a name="quantumleap-api---list-the-latest-n-sampled-values-of-devices-in-an-area"></a>

### QuantumLeap API - エリア内のデバイスの最新の N 個のサンプル値をリスト

この例は、 `52°33'16.9"N 13°23'55.0"E` (Bornholmer Straße 65, Berlin, Germany) を中心とする一辺 200 m の正方形の内側にあ
るランプの最新の 4 つのサンプリングされた `luminosity` 値を示しています。デバイス・モニタのページで利用可能なすべてのラ
ンプをつけたとしても、`Lamp:001` のデータだけを見るべきです。

> :information_source: **注:** 地理的クエリは、 [NGSI v2 仕様](http://fiware.github.io/specifications/ngsiv2/stable/) の
> 地理的クエリのセクションに詳述されている完全なクエリのセットを実装する、 QuantumLeap のバージョン `0.5` からのみ利用可
> 能です。

<a name="oneone-request"></a>

#### :one::one: リクエスト :

```console
curl -X GET \
  'http://localhost:8668/v2/types/Lamp/attrs/luminosity?lastN=4&georel=coveredBy&geometry=polygon&coords=52.5537,13.3996;52.5557,13.3996;52.5557,13.3976;52.5537,13.3976;52.5537,13.3996' \
  -H 'Accept: application/json' \
  -H 'Fiware-Service: openiot' \
  -H 'Fiware-ServicePath: /'
```

<a name="response-8"></a>

#### レスポンス :

```json
{
    "data": {
        "attrName": "luminosity",
        "entities": [
            {
                "entityId": "Lamp:001",
                "index": [
                    "2018-12-13T17:08:56.041",
                    "2018-12-13T17:09:55.976",
                    "2018-12-13T17:10:55.907",
                    "2018-12-13T17:11:55.833"
                ],
                "values": [999, 999, 999, 999]
            }
        ],
        "entityType": "Lamp"
    }
}
```

<a name="time-series-data-queries-cratedb"></a>

## 時系列データ・クエリ (CrateDB API)

**CrateDB** は、SQL クエリを送信するために使用できる
[HTTP エンドポイント](https://crate.io/docs/crate/reference/en/latest/interfaces/http.html)を提供します。エンドポイント
は、`<servername:port>/_sql` 下でアクセス可能です。

SQL ステートメントは POST リクエストの本体として JSON 形式で送信されます。ここで、SQL ステートメントは `stmt` 属性の値で
す。

> **CrateDB** にクエリするときと、**QuantumLeap** にするとき? 経験則として、**QuantumLeap** で常に作業することを好む理由
> は次のとおりです。
>
> -   あなたの経験は Orion のような FIWARE NGSI API に近いでしょう
> -   あなたのアプリケーションは、CrateDB の仕様や QuantumLeap の実装の詳細に結びつくことはありません
> -   QuantumLeap は他のバックエンドにも簡単に拡張でき、あなたのアプリはフリーで互換性を得ることができます
> -   デプロイメントが配布されている場合は、データベースのポートを外部に公開する必要はありません

**QuantumLeap** で実行したいクエリがサポートされていないことが確かな場合は、 **CrateDB** でクエリする必要がありますが、
開発チームが認識できるように [QuantumLeap の GitHub リポジトリ](https://github.com/smartsdk/ngsi-timeseries-api/issues)
で、issue をオープンしてください。

<a name="cratedb-api---checking-data-persistence"></a>

### CrateDB API - データの永続性のチェック

データが永続化されているかどうかを確認する別の方法は、`table_schema` が作成されたことをチェックすることです。 次のように
、**CrateDB** HTTP エンドポイントにリクエストすることでこれを行うことができます：

<a name="onetwo-request"></a>

#### :one::two: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW SCHEMAS"}'
```

<a name="response-9"></a>

#### レスポンス :

```json
{
    "cols": ["table_schema"],
    "rows": [["doc"], ["information_schema"], ["sys"], ["mtopeniot"], ["pg_catalog"]],
    "rowcount": 5,
    "duration": 10.5146
}
```

スキーマ名は、`mt` プレフィックスとそれに続く、小文字の `fiware-service` ヘッダで構成されます。IoT Agent は
、`FIWARE-Service` ヘッダ `openiot` を使用して、ダミー IoT デバイスから測定値を転送します。これらは `mtopeniot` スキーマ
の下に保持されています。

`mtopeniot` が存在しない場合は、**QuantumLeap** のサブスクリプションが正しく設定されていません。サブスクリプションが存在
し、データを正しい場所に送信するように設定されていることを確認します。

**QuantumLeap** は、エンティティ型に基づいて **CrateDB** データベース内の別のテーブルにデータを永続化します。テーブル名
は、`et` プレフィックスとエンティティ型の名前を小文字にして形成されます。

<a name="onethree-request"></a>

#### :one::three: リクエスト :

```console
curl -X POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SHOW TABLES"}'
```

<a name="response-10"></a>

#### レスポンス :

```json
{
    "cols": ["table_schema", "table_name"],
    "rows": [
        ["mtopeniot", "etmotion"],
        ["mtopeniot", "etlamp"]
    ],
    "rowcount": 2,
    "duration": 14.2762
}
```

レスポンスは、**モーション・センサ**のデータと**スマート・ランプ**のデータの両方がデータベースに保持されていることを示し
ます。

<a name="cratedb-api---list-the-first-n-sampled-values"></a>

### CrateDB API - 最初の N 個の サンプリング値のリスト

SQL 文は `ORDER BY` と `LIMIT` を使用してデータをソートします。詳細は、**CrateDB**
の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してください。

<a name="onefour-request"></a>

#### :one::four: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' ORDER BY time_index ASC LIMIT 3"}'
```

<a name="response-11"></a>

#### レスポンス :

```json
{
    "cols": ["entity_id", "entity_type", "fiware_servicepath", "luminosity", "time_index"],
    "rows": [
        ["Lamp:001", "Lamp", "/", 1750, 1530262765000],
        ["Lamp:001", "Lamp", "/", 1507, 1530262770000],
        ["Lamp:001", "Lamp", "/", 1390, 1530262775000]
    ],
    "rowcount": 3,
    "duration": 21.8338
}
```

<a name="cratedb-api---list-n-sampled-values-at-an-offset"></a>

### CrateDB API - N 個のサンプリング値をオフセットでリスト

SQL 文は、`OFFSET` 句を使用して必要な行を取り出します。詳細は、**CrateDB**
の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してください。

<a name="onefive-request"></a>

#### :one::five: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' order by time_index ASC LIMIT 3 OFFSET 3"}'
```

<a name="response-12"></a>

#### レスポンス :

```json
{
    "cols": ["count", "entity_id", "entity_type", "fiware_servicepath", "time_index"],
    "rows": [
        [0, "Motion:001", "Motion", "/", 1530262791452],
        [1, "Motion:001", "Motion", "/", 1530262792469],
        [0, "Motion:001", "Motion", "/", 1530262793472]
    ],
    "rowcount": 3,
    "duration": 54.215
}
```

<a name="cratedb-api---list-the-latest-n-sampled-values"></a>

### CrateDB API - 最新の N 個のサンプリングされた値のリスト

SQL 文は、最後の N 行を取り出すために `LIMIT` 節と結合された、`ORDER BY ... DESC` 節を使用します。詳細は
、**CrateDB**の[ドキュメント](https://crate.io/docs/crate/reference/en/latest/sql/statements/select.html)を参照してくだ
さい。

<a name="onesix-request"></a>

#### :one::six: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT * FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\''  ORDER BY time_index DESC LIMIT 3"}'
```

<a name="response-13"></a>

#### レスポンス :

```json
{
    "cols": ["count", "entity_id", "entity_type", "fiware_servicepath", "time_index"],
    "rows": [
        [0, "Motion:001", "Motion", "/", 1530263896550],
        [1, "Motion:001", "Motion", "/", 1530263894491],
        [0, "Motion:001", "Motion", "/", 1530263892483]
    ],
    "rowcount": 3,
    "duration": 18.591
}
```

<a name="cratedb-api---list-the-sum-of-values-grouped-by-a-time-period"></a>

### CrateDB API - 期間別にグループ化された値の合計をリスト

SQL 文は、`SUM` 関数と `GROUP BY` 句を使用して関連するデータを取得します。 **CrateDB** は、タイムスタンプを切り捨ててグ
ループ化できるデータに変換するための一連
の[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供
しています。

<a name="oneseven-request"></a>

#### :one::seven: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, SUM (count) AS sum FROM mtopeniot.etmotion WHERE entity_id = '\''Motion:001'\'' GROUP BY minute LIMIT 3"}'
```

<a name="response-14"></a>

#### レスポンス :

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

<a name="cratedb-api---list-the-minimum-values-grouped-by-a-time-period"></a>

### CrateDB API - 期間別にグループ化された最小値をリスト

SQL 文は、`MIN` 関数と `GROUP BY` 句を使用して関連するデータを取得します。 **CrateDB** は、タイムスタンプを切り捨ててグ
ループ化できるデータに変換するための一連の
[日時関数](https://crate.io/docs/crate/reference/en/latest/general/builtins/scalar.html#date-and-time-functions)を提供し
ています。

<a name="oneeight-request"></a>

#### :one::eight: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT DATE_FORMAT (DATE_TRUNC ('\''minute'\'', time_index)) AS minute, MIN (luminosity) AS min FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' GROUP BY minute"}'
```

<a name="response-15"></a>

#### レスポンス :

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

<a name="cratedb-api---list-the-maximum-value-over-a-time-period"></a>

### CrateDB API - ある期間の最大値のリスト

SQL 文は、`MAX`関数と `WHERE` 句を使用して関連するデータを取得します。**CrateDB** は、さまざまな方法でデータをアグリゲー
ションするため、一連の
[アグリゲーション関数](https://crate.io/docs/crate/reference/en/latest/general/dql/selects.html#data-aggregation) を提供
しています。

<a name="onenine-request"></a>

#### :one::nine: リクエスト :

```console
curl -iX POST \
  'http://localhost:4200/_sql' \
  -H 'Content-Type: application/json' \
  -d '{"stmt":"SELECT MAX(luminosity) AS max FROM mtopeniot.etlamp WHERE entity_id = '\''Lamp:001'\'' and time_index >= '\''2018-06-27T09:00:00'\'' and time_index < '\''2018-06-30T23:59:59'\''"}'
```

<a name="response-16"></a>

#### レスポンス :

```json
{
    "cols": ["max"],
    "rows": [[1753]],
    "rowcount": 1,
    "duration": 26.7215
}
```

<a name="accessing-time-series-data-programmatically"></a>

# プログラミングによる時系列データへのアクセス

指定された時系列の JSON レスポンスが取得されると、生のデータを表示することはエンドユーザにとってほとんど役に立たちません
。これは、棒グラフ、折れ線グラフ、またはテーブル・リストに表示するために操作する必要があります。これは、グラフィカルなツ
ールではないため、**QuantumLeap** のドメイン内にはありませんが
、[Wirecloud](https://github.com/FIWARE/catalogue/blob/master/processing/README.md#Wirecloud) や
[Knowage](https://github.com/FIWARE/catalogue/blob/master/processing/README.md#Knowage) などのマッシュアップやダッシュボ
ード・コンポーネントに任せることができます。

また、コーディング環境に適したサード・パーティのグラフ作成ツール ([chartjs](http://www.chartjs.org/) など) を使用して、
検索して表示することもできます。この例は
、[Git Repository](https://github.com/FIWARE/tutorials.Step-by-Step/blob/master/context-provider/controllers/history.js)
の `history` コントローラ内にあります。

基本的な処理は、検索と属性マッピングの 2 つのステップで構成されています。サンプルコードは以下のとおりです :

```javascript
function readCrateLampLuminosity(id, aggMethod) {
    return new Promise(function (resolve, reject) {
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

変更されたデータは、フロント・エンドに渡され、サード・パーティのグラフ作成ツールによって処理されます。結果は次のとおりで
す : `http://localhost:3000/device/history/urn:ngsi-ld:Store:001`

<a name="displaying-cratedb-data-as-a-grafana-dashboard"></a>

## CrateDB データを Grafana Dashboard として表示

**CrateDB** は、QuantumLeap の時系列データ・シンクとして選択されています。
[他の多くのメリット](https://quantumleap.readthedocs.io/en/latest/)の中でも、 [Grafana](https://grafana.com/) 時系列分析
ツールとシームレスに統合されています。 Grafana を使用して、アグリゲートされたセンサ・データを表示することができます。
[ここ](https://www.youtube.com/watch?v=sKNZMtoSHN4)でダッシュボードを構築するための完全なチュートリアルを見つけることが
できます。次の簡単な手順では、ランプの `luminosity` データのグラフを接続して表示する方法をまとめています。

<a name="logging-in"></a>

### ログイン

`docker-compose` ファイルは Grafana UI のインスタンスをポート `3003` でリッスンしているので、ログイン・ページは次の場所
にあります: `http://localhost:3003/login`。デフォルトのユーザー名は `admin` で、デフォルトのパスワードは `admin` です。

<a name="configuring-a-data-source"></a>

### データソースの設定

ログイン後、PostgreSQL のデータソースは、`http://localhost:3003/datasources` において、次の値 で設定する必要があります：

-   **Name** `CrateDB`
-   **Host** `crate-db:5432`
-   **Database** `mtopeniot`
-   **User** `crate`
-   **SSL Mode** `disable`

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-crate-connect.png)

Save をクリックし、_Database Connection OK_ メッセージがと表示されていることを確認します。

<a name="configuring-a-dashboard"></a>

### ダッシュボードの設定

新しいダッシュボードを表示するには、**+** ボタンをクリックして **Dashboard** を選択するか、直接
`http://localhost:3003/dashboard/new?orgId=1` にアクセスします。 その後、**Add Query** をクリックします。

**太字のテキスト**の次の値は、グラフ作成ウィザードに配置する必要があります :

-   Queries to **CrateDB** (以前に作成したデータソースから選択)
-   FROM **etlamp**
-   Time column **time_index**
-   Metric column **entity_id**
-   Select value **column:luminosity**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-graph.png)

次に、キーボードの `ESC` をクリックすると、作成したグラフを含むダッシュボードが表示されます。

`Add Panel` ボタンをクリックして `Choose Visualisation` を選択し、`Map panel` を選択します。

マップ・レイアウト・オプションで、次の値を設定します :

-   Center: **custom**
-   Latitude: **52.5031**
-   Longitude: **13.4447**
-   Initial Zoom: **12**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-1.png)

左側の `Queries` タブをクリックして、次のように設定します :

-   Format as: **Table**
-   FROM **etlamp**
-   Time column **time_index**
-   Metric column **entity_id**
-   Select value
    -   **column:luminosity** **alias:value**
    -   **column:location** **alias:geojson**
    -   **column:entity_type** **alias:type**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-2.png)

左側の `Visualisation` タブをクリックして、次のように設定します :

-   Map Layers:
    -   Lamp:
        -   Icon: **lightbulb-o**
        -   ClusterType: **average**
        -   ColorType: **fix**
        -   Column for value: **value**
        -   Maker color: **red**

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-lamp-map-config-3.png)

最終結果は以下の通りです :

![](https://fiware.github.io/tutorials.Time-Series-Data/img/grafana-result.png)

<a name="next-steps"></a>

# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか？このシリーズ
の[他のチュートリアル](https://www.letsfiware.jp/fiware-tutorials)を読むことで見つけることができます

---

## License

[MIT](LICENSE) © 2018-2023 FIWARE Foundation e.V.
