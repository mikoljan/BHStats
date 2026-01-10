import React from "react";

interface TableProps<T> {
  data: T[];
}

export function Table<T>({ data }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs">
        <thead>
          <tr>
            <th></th>
            <th>Jméno</th>
            <th>Z</th>
            <th>G</th>
            <th>A</th>
            <th>B</th>
            <th>TM</th>
            <th>Z</th>
            <th>G</th>
            <th>A</th>
            <th>B</th>
            <th>TM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>Stanislav Prokop</td>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
          </tr>
          <tr>
            <th>1</th>
            <td>Jiří Polívka</td>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
            <th>1</th>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Jméno</th>
            <th>Z</th>
            <th>G</th>
            <th>A</th>
            <th>B</th>
            <th>TM</th>
            <th>Z</th>
            <th>G</th>
            <th>A</th>
            <th>B</th>
            <th>TM</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
