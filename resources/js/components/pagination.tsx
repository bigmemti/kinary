import {
    Pagination as BasePagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from './ui/pagination';

export default function Pagination({ meta }: any) {
    const pages = [];

    for (let i = 1; i <= meta.last_page; i++) {
        pages.push(i);
    }

    return (
        <BasePagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href={meta.prev_page_url} />
                </PaginationItem>

                {pages.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            isActive={page === meta.current_page}
                            href={`?page=${page}`}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext href={meta.next_page_url} />
                </PaginationItem>
            </PaginationContent>
        </BasePagination>
    );
}
