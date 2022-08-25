import Issue from '../../utils/issues'

const re = {
  task_re:
    /sub-(.*?)_task-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*(?:_acq-[a-zA-Z0-9-]*)?(?:_run-\d+)?_/g,
  acq_re:
    /sub-(.*?)(_task-\w+.\w+)?(_acq-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*)(?:_run-\d+)?_/g,
  sub_re: /sub-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*_/g, // illegal character in sub
  ses_re: /ses-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*?_(.*?)/g, //illegal character in ses
}

const illegalchar_regex_list = [
  [re.task_re, 58, 'task name contains illegal character:'],
  [re.acq_re, 59, 'acq name contains illegal character:'],
  [re.sub_re, 62, 'sub name contains illegal character:'],
  [re.ses_re, 63, 'ses name contains illegal character:'],
]

const illegalCharacterTest = (fileList) => {
  const issues = []
  const fileKeys = Object.keys(fileList)
  fileKeys.forEach((key) => {
    const file = fileList[key]
    const completename = file.relativePath
    if (
      !(
        completename.startsWith('/derivatives') ||
        completename.startsWith('/code') ||
        completename.startsWith('/sourcedata')
      )
    ) {
      illegalchar_regex_list.map((regex) => {
        const err_regex = regex[0]
        const err_code = regex[1]
        const err_evidence = regex[2]

        if (err_regex.exec(completename)) {
          issues.push(
            new Issue({
              file: file,
              code: err_code,
              evidence: err_evidence + completename,
            }),
          )
        }
      })
    }
  })
  return issues
}

export default illegalCharacterTest
