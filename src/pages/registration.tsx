import Layout from "@/components/layout";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Table } from "antd";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

const RegistrationPage = () => {
  const { data: session, status } = useSession();
  const [sidebar, setSidebar] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [practitioner, setPractitioner] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDOB, setPatientDOB] = useState("");
  const [patientGender, setPatientGender] = useState("male");
  const [patientNIK, setPatientNIK] = useState("");
  const [patientBirthplace, setPatientBirthplace] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientCity, setPatientCity] = useState('');
  const [patientPostal, setPatientPostal] = useState('');
  const [patientRelative, setPatientRelative] = useState('');
  const [patientRelativePhone, setPatientRelativePhone] = useState('');
  const [patientMarital, setPatientMarital] = useState('S');

  const [ssNIK, setSSNIK] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const nikRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const birthplaceRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const relativeRef = useRef<HTMLInputElement>(null);
  const relativePhoneRef = useRef<HTMLInputElement>(null);

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

  const patients = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      // get patient list
      const { data } = await axios.get(
        process.env.NEXT_PUBLIC_BE_URL + "/patients"
      );
      return data.data;
    },
  });

  const newPatient = useMutation({
    mutationFn: async () => {
      if (!config.data.data.id) return alert("Please wait for initialization");
      if (
        patientName === "" ||
        patientDOB === "" ||
        patientGender === "" ||
        patientNIK === "" ||
        patientEmail === "" ||
        patientBirthplace === "" ||
        patientAddress === "" ||
        patientPhone === "" ||
        patientCity === "" ||
        patientPostal === "" ||
        patientRelative === "" ||
        patientRelativePhone === "" ||
        patientMarital === ""
      )
        return alert("All fields are required");

      // create new patient
      const { data } = await axios.request({
        url: process.env.NEXT_PUBLIC_BE_URL + "/patients",
        method: "post",
        data: {
          name: patientName,
          birthdate: patientDOB,
          gender: patientGender,
          nik: patientNIK,
          config_id: config.data.data.id,
          email: patientEmail,
          birthplace: patientBirthplace,
          address: patientAddress,
          phone: patientPhone,
          city: patientCity,
          postal: patientPostal,
          relative_name: patientRelative,
          relative_phone: patientRelativePhone,
          marital: patientMarital,
        },
      });

      nameRef.current!.value = '';
      nikRef.current!.value = '';
      dobRef.current!.value = '';
      emailRef.current!.value = '';
      birthplaceRef.current!.value = '';
      addressRef.current!.value = '';
      phoneRef.current!.value = '';
      cityRef.current!.value = '';
      postalRef.current!.value = '';
      relativeRef.current!.value = '';
      relativePhoneRef.current!.value = '';

      setPatientName('')
      setPatientDOB('')
      setPatientNIK('')
      setPatientGender('male')

      patients.refetch();
      setSidebar(false);

      return data;
    },
  });

  const ssPatientSearch = useMutation({
    mutationKey: ["ss-patient"],
    mutationFn: async () => {
      if (ssNIK === '') return alert('NIK is required');
      if (ssNIK.length < 13) return alert('NIK must be 13 characters or more')
      const { data } = await axios.get(
        process.env.NEXT_PUBLIC_BE_URL + "/patients/search?nik=" + ssNIK
      );
      return data.data;
    },
  })

  return (
    <Layout>
      <div className="w-full">
        <div>Registration Page</div>
        <div>
          <div className="flex justify-between items-center">
            <div>Patient List</div>
            <div>
              <div
                className="hover:font-semibold hover:text-red-500 cursor-pointer"
                onClick={() => setSidebar(!sidebar)}
              >
                New Patient
              </div>
            </div>
          </div>
          <div>
            <Table
              dataSource={patients.data}
              columns={[
                { title: "Name", dataIndex: "name" },
                { title: "DOB", dataIndex: "birthdate" },
                { title: "Gender", dataIndex: "gender" },
                { title: "NIK", dataIndex: "nik" },
              ]}
            />
          </div>
        </div>
        {sidebar && (
          <div className="absolute w-full flex justify-end inset-0">
            <div
              className="inset-0 bg-black/30 fixed z-10"
              onClick={() => setSidebar(false)}
            />
            <div className="relative w-1/3 bg-white p-4 z-20 flex flex-col gap-4 overflow-y-auto">
              <div>
                <div>Select Practitioner:</div>
                <div>
                  <select
                    className="p-2 w-full"
                    onChange={(e) => setPractitioner(e.target.value)}
                  >
                    <option value="1">Dr. Rizky - Spesialis Gigi</option>
                    <option value="2">Dr. Hawa - Spesialis Behel</option>
                  </select>
                </div>
              </div>
              <div>
                <div>Find Patient from SatuSehat:</div>
                <div className="flex items-center justify-between">
                  <input type="text" className="flex-1 border-2 border-black p-2 flex" onChange={e => setSSNIK(e.target.value)} />
                  <button className="p-2 bg-black border-2 border-black text-white" onClick={() => ssPatientSearch.mutate()}>Search</button>
                </div>
                {/* <div>{JSON.stringify(ssPatientSearch.data)}</div> */}
                {ssPatientSearch.isSuccess && ssPatientSearch.data.total === 0 && (
                  <div className="text-sm text-rose-500 font-mono">No Patient Found</div>
                )}
              </div>
              {
                ssPatientSearch.isSuccess && !ssPatientSearch.data.total && (
                  <>
                    <div>
                      <div className="font-bold">Please Create New patient</div>
                      <div>
                        <div className="grid grid-cols-2">
                          <div>Patient Name</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={nameRef}
                            onChange={(e) => setPatientName(e.target.value)}
                            value={patientName}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Email</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={emailRef}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            value={patientEmail}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>DOB</div>
                          <input
                            type="date"
                            className="border-2 p-2"
                            ref={dobRef}
                            onChange={(e) => setPatientDOB(e.target.value)}
                            value={patientDOB}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Birth Place</div>
                          <input
                            type="date"
                            className="border-2 p-2"
                            ref={birthplaceRef}
                            onChange={(e) => setPatientBirthplace(e.target.value)}
                            value={patientBirthplace}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Gender</div>
                          <select
                            className="border-2 p-2"
                            onChange={(e) => setPatientGender(e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2">
                          <div>NIK</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={nikRef}
                            onChange={(e) => setPatientNIK(e.target.value)}
                            value={patientNIK}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Marital Status</div>
                          <select
                            className="border-2 p-2"
                            onChange={(e) => setPatientMarital(e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="S">Single</option>
                            <option value="M">Married</option>
                            <option value="U">Unmarried</option>
                            <option value="D">Divorced</option>
                            <option value="L">Legally Separated</option>
                            <option value="I">Interlocutory</option>
                            <option value="W">Widowed</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Phone</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={phoneRef}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            value={patientPhone}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Address</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={addressRef}
                            onChange={(e) => setPatientAddress(e.target.value)}
                            value={patientAddress}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>City</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={cityRef}
                            onChange={(e) => setPatientCity(e.target.value)}
                            value={patientCity}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Postal Code</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={postalRef}
                            onChange={(e) => setPatientPostal(e.target.value)}
                            value={patientPostal}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Relative Name</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={relativeRef}
                            onChange={(e) => setPatientRelative(e.target.value)}
                            value={patientRelative}
                          />
                        </div>
                        <div className="grid grid-cols-2">
                          <div>Relative Phone</div>
                          <input
                            type="text"
                            className="border-2 p-2"
                            ref={relativePhoneRef}
                            onChange={(e) => setPatientRelativePhone(e.target.value)}
                            value={patientRelativePhone}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button className="py-2 px-4 bg-black text-white" onClick={() => newPatient.mutate()}>
                        Submit and Sync to SatuSehat
                      </button>
                    </div>
                  </>
                )
              }
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RegistrationPage;
