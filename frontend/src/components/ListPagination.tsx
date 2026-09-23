import { Box, Pagination } from "@mui/material";

type ListPaginationProps = {
  count: number;
  pageSize: number;
  page: number;
  onChange: (page: number) => void;
};

export default function ListPagination({ count, pageSize, page, onChange }: ListPaginationProps) {
  const pageCount = Math.ceil(count / pageSize);

  if (pageCount <= 1) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Pagination
        color="primary"
        count={pageCount}
        page={page}
        onChange={(_, value) => onChange(value)}
      />
    </Box>
  );
}
