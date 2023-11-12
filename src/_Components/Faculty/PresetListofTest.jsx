import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

function Preset({ setClicked, clicked }) {
  const { TUPCID } = useTUPCID();
  const [presetList, setPresetList] = useState([]);
  const [sorted, setSorted] = useState(false);

  const fetchingPresetTestList = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/Preset?UidProf=${TUPCID}`
      );
      if (response.status === 200) {
        setPresetList(response.data);
      } else {
        alert("Problem");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const Oldest = () => {
    setSorted(true)
    const sortedpreset = [...presetList].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    setPresetList(sortedpreset);
  }
  const Newest = () => {
    setSorted(true)
    const sortedpreset = [...presetList].sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
    setPresetList(sortedpreset);
  }
  useEffect(() => {
    const fetching = setInterval(() => {
      if(sorted){
        return;
      }
      fetchingPresetTestList();
    }, 2000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID, sorted]);
  const handleclick = () => {
    setClicked(!clicked);
  };
  return (
    <main className="w-100 min-vh-100 d-flex justify-content-center">
      <section className="contatiner col-12 text-sm-start text-center d-flex flex-column align-items-start p-2">
        <div className="d-flex align-items-center gap-3 w-100">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <div className="d-flex align-items-center gap-2 w-100">
            <Link href={{ pathname: "/Faculty" }} className="d-sm-block d-none">
              <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
            </Link>
            <h2 className="m-0 pe-3 w-100 text-sm-start text-center">
              FACULTY
            </h2>
          </div>
        </div>
        <div className="d-flex justify-content-between w-100 px-2">
          <h3>PRESETS</h3>
          <div className="d-flex flex-column align-self-end">
            <small className="text-end">Sort by:</small>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-dark" onClick={Oldest}>Oldest</button>
              <button className="btn btn-sm btn-outline-dark" onClick={Newest}>Newest</button>
            </div>
          </div>
        </div>
        {/* Tests */}
        <div className="row m-0 mt-4 col-12 gap-1">
          {presetList.map((test, index) => (
            <div
              className="px-3 py-2 border border-dark rounded col-12"
              key={index}
            >
              <div className="d-flex justify-content-between">
                <span>
                  {test.TestName} {test.Subject} {test.Course}-{test.Year}&nbsp;
                  {test.Section}&nbsp;
                  {test.Uid_Test}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* End of Tests  */}
      </section>
    </main>
  );
}
export default Preset;
