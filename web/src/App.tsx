import React, { useState } from "react"
import "./App.css"
import { directoryOpen } from "https://esm.sh/browser-fs-access@0.35.0"
import { fileListToTree, validate } from "../dist/validator/main.js"
import type { ValidationResult } from "../../bids-validator/src/types/validation-result.ts"
import { Collapse } from "./Collapse.tsx"
import { Summary } from "./Summary.tsx"

function Files({ files }) {
  return (
    <ul>
      {Array.from(files.entries()).map(([key, value]) => {
        if (value && !key) {
          return <li key={value}>{value.evidence}</li>
        }
        return <li key={key}>{key}</li>
      })}
    </ul>
  )
}

function Issue({ data }) {
  return (
    <div className={data.severity}>
      <Collapse label={`${data.severity}: ${data.key}`}>
        <div>{data.reason}</div>
        {data.files.size && <Files files={data.files}></Files>}
        <p>
          <a href={`https://neurostars.org/search?q=${data.key}`}>
            Search for this issue on Neurostars.
          </a>
        </p>
      </Collapse>
    </div>
  )
}

function App() {
  const [validation, setValidation] = useState<ValidationResult>()

  async function validateDir() {
    const dirHandle = await directoryOpen({
      recursive: true,
    })
    const fileTree = await fileListToTree(dirHandle)
    setValidation(await validate(fileTree, {}))
  }

  let validatorOutput

  if (validation) {
    const issuesList = Array.from(validation.issues.keys()).map((key) => (
      <li key={key}>
        <Issue data={validation.issues.get(key)} />
      </li>
    ))
    validatorOutput = (
      <>
        <button onClick={validateDir}>Reselect Files</button>
        <div>
          <ul className="issues-list">
            {issuesList}
          </ul>
          <Summary data={validation.summary} />
          <a
            href={`data:application/json:${JSON.stringify(validation)}`}
            target="_blank"
            download="bids-validator-output.json"
          >
            Save JSON log.
          </a>
        </div>
      </>
    )
  } else {
    validatorOutput = (
      <>
        <h2>
          Select a{" "}
          <a href="https://bids.neuroimaging.io" target="_blank">
            BIDS dataset
          </a>{" "}
          to validate.
        </h2>
        <button onClick={validateDir}>Select Dataset Files</button>
      </>
    )
  }

  return (
    <>
      <h1>BIDS Validator</h1>
      {validatorOutput}
      <div>
        Note: Selecting a dataset only performs validation. Files are never
        uploaded.
      </div>
      <div>Previous version of the BIDS validator (non-schema) available <a href="https://bids-standard.github.io/bids-validator/legacy">here.</a></div>
    </>
  )
}

export default App
