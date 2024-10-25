import Layout from "@/components/layout";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Module = {
  id: number;
  module_name: string;
  activated_at: number;
  config_id: number;
}

const LandingPage = () => {
  const { data: session, status } = useSession();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const [moduleName, setModuleName] = useState('');

  const [createModule, setCreateModule] = useState(false);

  const config = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      console.log('user:', session?.user)
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL+'/config',
        method: 'get',
        headers: { 'user_id': session?.user?.email }
      })

      return data;
    },
    enabled: status === 'authenticated'
  });

  const modules = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL+'/config/modules',
        method: 'get',
        headers: { 'user_id': session?.user?.email }
      })

      return data;
    },
    enabled: status === 'authenticated' && config.isSuccess && config.data.code === 'C1'
  });

  const newConfig = useMutation({
    mutationFn: async () => {
      if (name === '' || address === '') return alert('Hospital name and address is required');
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL+'/config',
        method: 'post',
        headers: { 'user_id': session?.user?.email },
        data: {
          name,
          address
        }
      })

      await config.refetch();

      return data;
    }
  })

  const newModule = useMutation({
    mutationFn: async () => {
      if (moduleName === '') return alert('Module name is required');
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL+'/config/modules',
        method: 'post',
        data: {
          name: moduleName,
          config_id: config.data.data.id,
        }
      })

      await modules.refetch();

      setCreateModule(false);

      return data;
    }
  })

  return (
    <Layout>
      {status ==='authenticated' && config.isSuccess && config.data.code === 'C0' && (
        <div className="flex flex-col gap-2">
          <div>Register your Merchant first</div>
          <div>
            <div>Hospital Name</div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border-2 p-2" />
          </div>
          <div>
            <div>Hospital Address</div>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="border-2 p-2" />
          </div>
          <div>
            <button className="p-2 bg-black text-white" onClick={() => newConfig.mutate()}>Register Hospital</button>
          </div>
        </div>
      )}
      {status ==='authenticated' && config.isSuccess && config.data.code === 'C1' && (
        <div>
          <div>Welcome to Potion Merchant</div>
          <div className="text-3xl font-semibold">{config.data.data.hospital_name}</div>
          <div className="text-sm">{config.data.data.hospital_address}</div>
          <div>Active module: {modules.isSuccess && (
            <span className="font-semibold font-mono">{modules.data.data.map((module: Module) => module.module_name).join(', ')}</span>
          )}</div>
          <div>{modules.isSuccess && modules.data.code === 'M0' && <div className="hover:font-semibold hover:text-red-500" onClick={() => setCreateModule(!createModule)}>New Module</div>}</div>
          {createModule && (
            <div>
              <div>Module Name</div>
              <input type="text" value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="border-2 p-2" />
              <div>
                <button className="p-2 bg-black text-white" onClick={() => newModule.mutate()}>Create Module</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default LandingPage;