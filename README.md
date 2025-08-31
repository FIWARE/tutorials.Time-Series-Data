[![FIWARE Banner](https://fiware.github.io/tutorials.Time-Series-Data/img/fiware.png)](https://www.fiware.org/developers)

[![FIWARE Core Context Management](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/core.svg)](https://github.com/FIWARE/catalogue/blob/master/core/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Time-Series-Data.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)

These tutorials are an introduction to [FIWARE QuantumLeap](https://quantumleap.readthedocs.io/en/latest/) - a generic
enabler which is used to persist context data into a **CrateDB** database. The tutorial activates the IoT sensors
connected in the previous tutorials and persists measurements from those
sensors into the database. To retrieve time-based aggregations of such data, users can either use **QuantumLeap** query
API or connect directly to the **CrateDB** HTTP endpoint. Results are visualised on a graph or via the **Grafana** time
series analytics tool.

The tutorials use [cUrl](https://ec.haxx.se/) commands throughout, but are also available as
[Postman documentation](https://www.postman.com/downloads/)

> [!NOTE]
> 
>  For **NGSI-LD** context brokers, use of the [NGSI-LD temporal API](https://github.com/FIWARE/tutorials.Short-Term-History/tree/NGSI-LD) is generally preferred where it
>  is available. More information on the different approaches available for time series for **NGSI-v2** and **NGSI-LD** can be found [here](https://www.youtube.com/watch?v=w6ymNPO-Baw&t=2309s)

# Start-Up

## NGSI-v2 Smart Supermarket

**NGSI-v2** offers JSON based interoperability used in individual Smart Systems. To run this tutorial with **NGSI-v2**, use the `NGSI-v2` branch.

```console
git clone https://github.com/FIWARE/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data
git checkout NGSI-v2

./services create
./services start
```

| [![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/) | :books: [Documentation](https://github.com/FIWARE/tutorials.Time-Series-Data/tree/NGSI-v2) | <img src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/postman.svg" height="15" width="15"> [Postman Collection](https://fiware.github.io/tutorials.Time-Series-Data/) | ![](https://img.shields.io/github/last-commit/fiware/tutorials.Time-Series-Data/NGSI-v2)
| --- | --- | --- | ---

## NGSI-LD Smart Farm

**NGSI-LD** offers JSON-LD based interoperability used for Federations and Data Spaces. To run this tutorial with **NGSI-LD**, use the `NGSI-LD` branch.

```console
git clone https://github.com/FIWARE/tutorials.Time-Series-Data.git
cd tutorials.Time-Series-Data
git checkout NGSI-LD

./services create
./services start
```

| [![NGSI LD](https://img.shields.io/badge/NGSI-LD-d6604d.svg)](https://cim.etsi.org/NGSI-LD/official/front-page.html) | :books: [Documentation](https://github.com/FIWARE/tutorials.Time-Series-Data/tree/NGSI-LD) | <img  src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/postman.svg" height="15" width="15"> [Postman Collection](https://fiware.github.io/tutorials.Time-Series-Data/ngsi-ld.html) | ![](https://img.shields.io/github/last-commit/fiware/tutorials.Time-Series-Data/NGSI-LD)
| --- | --- | --- | ---

---

## License

[MIT](LICENSE) © 2018-2024 FIWARE Foundation e.V.
