import { useIsLarge } from '@/hooks/use-breakpoint';

type Column<T> = {
    header: React.ReactNode;
    cell: (item: T) => React.ReactNode;
    card?: (item: T) => React.ReactNode;
};

type Props<T> = {
    data: T[];
    columns: Column<T>[];
};

export default function ResponsiveDataList<T>({ data, columns }: Props<T>) {
    const isLarge = useIsLarge();

    return (
        <>
            {isLarge ? (
                <DataTable data={data} columns={columns} />
            ) : (
                <DataCard data={data} columns={columns} />
            )}
        </>
    );
}
// TODO: refactor
function DataCard<T>({ data, columns }: Props<T>) {
    return (
        <ul className="mx-4 mt-4 grid gap-4 lg:grid-cols-2">
            {data.map((item, i) => (
                <li key={i} className="rounded-xl border border-foreground p-4">
                    {columns.map((col, j) => (
                        <div key={j} className="text-center">
                            {col.header} :{' '}
                            {col.card ? col.card(item) : col.cell(item)}
                        </div>
                    ))}
                </li>
            ))}
        </ul>
    );
}

function DataTable<T>({ data, columns }: Props<T>) {
    return (
        <table className="w-full border-separate border-spacing-y-2">
            <thead>
                <tr>
                    {columns.map((col, i) => (
                        <th key={i}>{col.header}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex} className="text-center">
                                {col.cell(item)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            {/* <tfoot>
                <tr>
                    {columns.map((col, i) => (
                        <th key={i}>{col.header}</th>
                    ))}
                </tr>
            </tfoot> */}
        </table>
    );
}
