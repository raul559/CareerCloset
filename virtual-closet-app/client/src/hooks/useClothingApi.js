import { useEffect, useState } from "react";

export function useClothingApi({ page = 1, limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageLimit, setPageLimit] = useState(limit);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clothing?userId=virtual-closet-user&page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setCurrentPage(data.page || page);
        setPageLimit(data.limit || limit);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [page, limit]);

  return { items, loading, error, total, page: currentPage, limit: pageLimit };
}
