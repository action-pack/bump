const core = require("@actions/core");
const github = require("@actions/github");

const token = core.getInput("token");
const octokit = github.getOctokit(token);

const context = github.context;
const repoName = context.payload.repository.name;
const ownerName = context.payload.repository.owner.login;

let repository = core.getInput("repository");
if (repository === "false") repository = repoName;

let owner = core.getInput("owner");
if (owner === "false") owner = ownerName;

const push_to_org = core.getInput("org") !== "false";

function get_() {

  if (push_to_org) return "/orgs/" + owner;
  if (repository.includes("/")) return "/repos/" + repository;

  return "/repos/" + owner + "/" + repository;

}

function increment(string) {

  // Extract string's number
  var number = string.match(/\d+/) === null ? 0 : string.match(/\d+/)[0];

  // Store number's length
  var numberLength = number.length;

  // Increment number by 1
  number = (parseInt(number, 10) + 1).toString();

  // If there were leading 0s, add them again
  while (number.length < numberLength) {
    number = "0" + number;
  }

  return string.replace(/[0-9]/g, "").concat(number);
}

const createVariable = (varname, data) => {

  let url = "POST ";
  url += get_();
  url += "/actions/variables";

  return octokit.request(url, {
    owner: owner,
    repo: repository,
    name: varname,
    value: data,
  });
};

const setVariable = (varname, data) => {

  let url = "PATCH ";
  url += get_();
  url += "/actions/variables/" + varname;

  return octokit.request(url, {
    owner: owner,
    repo: repository,
    name: varname,
    value: data,
  });
};

const getVariable = (varname) => {

  let url = "GET ";
  url += get_();
  url += "/actions/variables/" + varname;

  return octokit.request(url, {
    owner: owner,
    repo: repository,
    name: varname,
  });
};

const bootstrap = async () => {

  let exists = false;
  let old_minor = "";
  let new_minor = "";
  let old_major = "";
  let new_major = "";

  try {

    const response = await getVariable("MAJOR");

    exists = response.status === 200;
    if (exists) old_major = response.data.value;

  } catch (e) {
    // Variable does not exist
  }

  if (!exists) {

    try {

      old_major = "1";
      const response = await createVariable("MAJOR", old_major);

      if (response.status !== 201) {
        throw new Error("ERROR: Wrong status was returned: " + response.status);
      }

    } catch (e) {
      core.setFailed(get_() + ": " + e.message);
      console.error(e);
      return null;
    }
  }

  try {

    const response = await getVariable("MINOR");

    exists = response.status === 200;
    if (exists) old_minor = response.data.value;

  } catch (e) {
    // Variable does not exist
  }

  try {

    if (exists) {

      if (old_minor === "0" || old_minor === "00") {
        new_minor = "01";
      } else {
        new_minor = increment(old_minor);
      }

      if (new_minor === "100") {
        new_minor = "0";
        new_major = increment(old_major);
      } else {
        new_major = old_major;
      }

      if (old_major !== new_major) {

        const response = await setVariable("MAJOR", new_major);

        if (response.status !== 204) {
          throw new Error("ERROR: Wrong status was returned: " + response.status);
        }
      }

      const response = await setVariable("MINOR", new_minor);

      if (response.status === 204) {
        return ("Version incremented from v" + old_major + "." + old_minor + " to v" + new_major + "." + new_minor + ".");
      }

      throw new Error("ERROR: Wrong status was returned: " + response.status);

    } else {

      new_minor = "0";
      const response = await createVariable("MINOR", new_minor);

      if (response.status === 201) {
        return ("Version set to default value of v" + old_major + "." + new_minor);
      }

      throw new Error("ERROR: Wrong status was returned: " + response.status);
    }

  } catch (e) {
    core.setFailed(get_() + ": " + e.message);
    console.error(e);
    return null;
  }
};

bootstrap()
  .then(
    (result) => {
      // eslint-disable-next-line no-console
      if (result != null) {
        console.log(result);
      }
    },
    (err) => {
      // eslint-disable-next-line no-console
      core.setFailed(err.message);
      console.error(err);
    },
  )
  .then(() => {
    process.exit();
  });
