# csv2table

A svelte library for creating a basic table from a CSV file.

- light weight
- no default styling

## Starting 🚀

\_ You will need svelte and npm to use this package. Get started by downloading [svelte](http://svelte.dev)

See ** Deployment ** to learn how to deploy the project.

### Installation 🔧

_A series of step-by-step examples that tell you what you need to run to have a development environment running_

_To install using yarn_

`yarn add csv2table`

_or npm_

`npm i csv2table`

## Usage 📦

_basic table without header_

```
<script>
  import {BasicTable} from 'csv2table'
  import csvData from './csvData'
</script>
<BasicTable csv={csvData} csvColumnDelimiter="," hasHeader={false} />

```

_basic table with header_

```

<script>
  import {BasicTable} from 'csv2table'
  import csvData from './csvData'
</script>'
<BasicTable csv={csvData} csvColumnDelimiter="," />
```

_basic table with header and global styles_
![table with green header](https://github.com/StudentOfJS/csv2table/blob/master/images/greenTable.png)

```

<script>
  import { BasicTable } from "./table";
  import { TEST_DATA } from "../testData";
</script>

<style>
  :global(table) {
    border-collapse: collapse;
    width: 100%;
  }

  :global(th),
  :global(td) {
    text-align: left;
    padding: 8px;
  }

  :global(tr:nth-child(even)) {
    background-color: #f2f2f2;
  }

  :global(th) {
    background-color: #4caf50;
    color: white;
  }
</style>

<BasicTable csv={TEST_DATA} csvColumnDelimiter="," />
```

_basic table with passed class_
![table with blue header](https://github.com/StudentOfJS/csv2table/blob/master/images/blueTable.png)

```
<script>
  import { BasicTable } from "./table";
  import { TEST_DATA } from "../testData";
</script>

<style>
  :global(.paleBlueRows) {
    font-family: Tahoma, Geneva, sans-serif;
    border: 1px solid #ffffff;
    width: 350px;
    height: 200px;
    text-align: center;
    border-collapse: collapse;
  }
  :global(.paleBlueRows) td,
  :global(.paleBlueRows) th {
    border: 1px solid #ffffff;
    padding: 3px 2px;
  }
  :global(.paleBlueRows) tbody td {
    font-size: 14px;
    color: #333333;
  }
  :global(.paleBlueRows) tr:nth-child(even) {
    background: #d0e4f5;
  }
  :global(.paleBlueRows) thead {
    background: #0b6fa4;
    border-bottom: 5px solid #ffffff;
  }
  :global(.paleBlueRows) thead th {
    font-size: 17px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    border-left: 2px solid #ffffff;
  }
  :global(.paleBlueRows) thead th:first-child {
    border-left: none;
  }
</style>

<BasicTable csv={TEST_DATA} csvColumnDelimiter="," tableClass="paleBlueRows" />

```

## Options 🛠️

_defaults_

- csvRowDelimiter _default = '\n'_
- csvColumnDelimiter _default = '\t'_
- hasHeader _default = true_

_styling_

- tableClass
- tableRowClass
- tableColumnClass

## Versioned 📌

We use [SemVer](http://semver.org/) for versioning.

## Authors ✒️

- ** Rod Lewis ** - _ Initial Work _ - [StudentOfJS](https://github.com/StudentOfJS)

You can also look at the list of all [contributors](https://github.com/studentofjs/csv2table/contributors) who have participated in this project.

## License 📄

[MIT](LICENSE)

## Expressions of Gratitude 🎁

_over 1 billion animals are estimated to have died in the recent and ongoing bushfires in Australia. Many more are displaced and face an uncertain future, even extinction in some cases. If csv2table made your day a little easier and you want to thank me, please consider helping out_

- [RSPCA Australia](https://www.rspca.org.au/blog/2020/how-help-animals-during-bushfire-crisis)

---

⌨️ with ❤️ by [StudentOfJS](https://github.com/StudentOfJS) 😊
