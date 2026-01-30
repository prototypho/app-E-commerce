import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name'); 

        if (error) {
           // If table doesn't exist, we might get an error. 
           // For dev purposes, if error is "relation not found", we might return mock data?
           // But instruction says "connected to Supabase".
           throw error;
        }

        if (signal.aborted) return;
        setProducts(data || []);
      } catch (err: any) {
        if (signal.aborted) return;
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, []);

  return { products, loading, error };
};
