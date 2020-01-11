<script>
  export let csv;
  export let csvRowDelimiter = "\n";
  export let csvColumnDelimiter = "\t";
  export let hasHeader = true;
  export let tableClass = "";
  export let tableRowClass = "";
  export let tableColumnClass = "";
  $: rows = csv ? csv.split(csvRowDelimiter) : null;
  $: table = rows ? rows.map((row, i) => row.split(csvColumnDelimiter)) : [];
  $: header = hasHeader && table && table.length ? table[0] : null;
  $: body =
    table && table.length
      ? hasHeader
        ? table.slice(1, table.length)
        : table
      : null;
</script>

<table class={tableClass}>
  {#if header}
    <thead>
      <tr>
        {#each header as column, i}
          <th key={`table-col-${i}`}>{column}</th>
        {/each}
      </tr>
    </thead>
  {/if}
  {#if body}
    <tbody>
      {#each body as row, rowI}
        <tr class={tableRowClass} key={`${row ? row : 'row'}-${rowI}`}>
          {#each row as column, colI}
            <td class={tableColumnClass} key={`${column}-${colI}-'${rowI}`}>
              {column}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  {/if}
</table>
