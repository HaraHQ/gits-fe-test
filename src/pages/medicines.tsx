import Layout from '@/components/layout';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from 'antd';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface Medicine {
  id: number;
  medicine_name: string;
  sku: string;
  stock: number;
  price: number;
  config_id: number;
}

const MedicinesPage = () => {
  const { data: session, status } = useSession();

  const [modal, setModal] = useState<'c'|'r'|'u'|'d'|false>(false);

  const [id, setId] = useState(0);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);

  const nameRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const stockRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  
  const config = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      console.log("user:", session?.user);
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL + "/config",
        method: "get",
        headers: { user_id: session?.user?.email },
      });

      return data;
    },
    enabled: status === "authenticated",
  });
  const items = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data } = await axios.get(process.env.NEXT_PUBLIC_BE_URL + '/medications');
      return data;
    }
  })
  const createItem = useMutation({
    mutationKey: ['items', 'create'],
    mutationFn: async () => {
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL + '/medications',
        method: 'post',
        data: {
          name,
          sku,
          stock,
          price,
          config_id: config.data.data.id,
        }
      });

      items.refetch();

      nameRef.current!.value = '';
      skuRef.current!.value = '';
      stockRef.current!.value = '';
      priceRef.current!.value = '';

      setModal(false);

      return data;
    }
  });
  const updateItem = useMutation({
    mutationKey: ['items', 'update'],
    mutationFn: async () => {
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL + '/medications/' + id,
        method: 'put',
        data: {
          name,
          sku,
          stock,
          price,
        }
      });

      items.refetch();

      nameRef.current!.value = '';
      skuRef.current!.value = '';
      stockRef.current!.value = '';
      priceRef.current!.value = '';

      setModal(false);

      return data;
    }
  });
  const deleteItem = useMutation({
    mutationKey: ['items', 'delete'],
    mutationFn: async () => {
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL + '/medications/' + id,
        method: 'delete'
      });

      items.refetch();

      setModal(false);

      return data;
    }
  });

  const setViewTo = (variant: 'c' | 'r' | 'u' | 'd', id?: number) => {
    switch(variant){
      case 'c':
        setModal('c');
        break;
      case 'r':
        const read = items.data.data.find((x: Medicine) => x.id === id);
        setId(read.id);
        setName(read.medicine_name);
        setSku(read.sku);
        setStock(read.stock);
        setPrice(read.price);
        setModal('r');
        break;
      case 'u':
        const update = items.data.data.find((x: Medicine) => x.id === id);
        setId(update.id);
        setName(update.medicine_name);
        setSku(update.sku);
        setStock(update.stock);
        setPrice(update.price);
        setModal('u');
        break;
      case 'd':
        const del = items.data.data.find((x: Medicine) => x.id === id);
        setId(del.id);
        setModal('d');
        break;
    }
  }
  return (
    <Layout>
      <div className='w-full flex flex-col gap-2'>
        <div>Medicines</div>
        <div className='flex justify-end'>
          <div className='p-2 bg-black text-white' onClick={() => setViewTo('c')}>Create</div>
        </div>
        <div className='w-full grid grid-cols-4 gap-2'>
          {items.isSuccess && items.data.data.map((x: Medicine) => (
            <Card key={x.id} className='w-full' hoverable cover={<Image alt="example" src="/pill.webp?v=1" width={480} height={140} onClick={() => setViewTo('r', x.id)} />}>
              <Card.Meta title={`${x.medicine_name} | ${x.sku}`} description={`Stock: ${x.stock} | Base Price: Rp ${x.price}`} />
            </Card>
          ))}
        </div>
        <AnimatePresence>
        {modal === 'c' && (
          <div className='absolute w-full flex justify-end inset-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/30 z-10' onClick={() => setModal(false)}></motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              className='relative w-1/2 bg-white p-4 z-20 flex flex-col gap-4 overflow-y-auto'>
              <div className='text-2xl font-mono'>Create</div>
              <div>
                <div>Name</div>
                <input type="text" ref={nameRef} onChange={(e) => setName(e.target.value)} className='border-2 p-2' />
              </div>
              <div>
                <div>SKU</div>
                <input type="text" ref={skuRef} onChange={(e) => setSku(e.target.value)} className='border-2 p-2' />
              </div>
              <div>
                <div>Stock</div>
                <input type="number" ref={stockRef} onChange={(e) => setStock(parseInt(e.target.value))} className='border-2 p-2' />
              </div>
              <div>
                <div>Price</div>
                <input type="number" ref={priceRef} onChange={(e) => setPrice(parseInt(e.target.value))} className='border-2 p-2' />
              </div>
              <div className='flex gap-4'>
                <button className='p-2 bg-red-500 text-white' onClick={() => setModal(false)}>Close</button>
                <button className='p-2 bg-black text-white' onClick={() => createItem.mutate()}>Create</button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {modal === 'r' && (
          <div className='absolute w-full flex justify-end inset-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/30 z-10' onClick={() => setModal(false)}></motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              className='relative w-1/2 bg-white p-4 z-20 flex flex-col gap-4 overflow-y-auto'>
              <div className='text-2xl font-mono'>Create</div>
              <div>
                <div>Name</div>
                <div className='text-xl'>{name}</div>
              </div>
              <div>
                <div>SKU</div>
                <div className='text-xl'>{sku}</div>
              </div>
              <div>
                <div>Stock</div>
                <div className='text-xl'>{stock}</div>
              </div>
              <div>
                <div>Price</div>
                <div className='text-xl'>{price}</div>
              </div>
              <div className='flex gap-4'>
                <button className='p-2 bg-red-500 text-white' onClick={() => setModal(false)}>Close</button>
                <button className='p-2 bg-purple-500 text-white' onClick={() => setViewTo('d', id)}>Delete</button>
                <button className='p-2 bg-black text-white' onClick={() => setViewTo('u', id)}>Change</button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {modal === 'u' && (
          <div className='absolute w-full flex justify-end inset-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/30 z-10' onClick={() => setModal(false)}></motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }} className='relative w-1/2 bg-white p-4 z-20 flex flex-col gap-4 overflow-y-auto'>
              <div className='text-2xl font-mono'>Update</div>
              <div>
                <div>Name</div>
                <input type="text" ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} className='border-2 p-2' />
              </div>
              <div>
                <div>SKU</div>
                <input type="text" ref={skuRef} value={sku} onChange={(e) => setSku(e.target.value)} className='border-2 p-2' />
              </div>
              <div>
                <div>Stock</div>
                <input type="number" ref={stockRef} value={stock} onChange={(e) => setStock(parseInt(e.target.value))} className='border-2 p-2' />
              </div>
              <div>
                <div>Price</div>
                <input type="number" ref={priceRef} value={price} onChange={(e) => setPrice(parseInt(e.target.value))} className='border-2 p-2' />
              </div>
              <div className='flex gap-4'>
                <button className='p-2 bg-red-500 text-white' onClick={() => setModal('r')}>Close</button>
                <button className='p-2 bg-black text-white' onClick={() => updateItem.mutate()}>Update</button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {modal === 'd' && (
          <div className='absolute w-full flex justify-end inset-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/30 z-10' onClick={() => setModal(false)}></motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              className='relative w-1/2 bg-white p-4 z-20 flex flex-col gap-4 overflow-y-auto'>
              <div className='text-2xl font-mono'>Delete</div>
              <div>
                <div className='text-red-400'>⚠️ Are you sure want to delete this ?</div>
                <div>Name</div>
                <div className='text-xl'>{name}</div>
              </div>
              <div className='flex gap-4'>
                <button className='p-2 bg-red-500 text-white' onClick={() => setViewTo('r', id)}>Cancel</button>
                <button className='p-2 bg-black text-white' onClick={() => deleteItem.mutate()}>Delete</button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default MedicinesPage;