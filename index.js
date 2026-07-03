const core = require("@actions/core");
const github = require("@actions/github");

const token = core.getInput("token");
const octokit = github.getOctokit(token);

const visibility = input("visibility", "all");
const push_to_org = (input("org", "") !== "");
const owner = input("owner", github.context.payload.repository.owner.login);
const repository = input("repository", github.context.payload.repository.name);

function path_() {

  if (push_to_org) return "/orgs/" + owner;
  if (repository.includes("/")) return "/repos/" + repository;

  return "/repos/" + owner + "/" + repository;
}

function input(name, def) {

  let inp = core.getInput(name).trim();
  if (inp === "" || inp.toLowerCase() === "false") return def;

  return inp;
}

function increment(string, amount) {

  const value = String(string || "");
  const step = Number.parseInt(amount, 10);

  if (!Number.isInteger(step) || step.toString() !== String(amount).trim()) {
    throw new Error(`Invalid amount '${amount}', expected an integer.`);
  }

  // Extract string's number
  var number = value.match(/\d+/) === null ? "" : value.match(/\d+/)[0];

  if (number === "") {
    throw new Error(`Value '${value}' does not contain a number to increment.`);
  }

  // Store number's length
  var numberLength = number.length;
  var leadingZeroes = number.startsWith("0");

  // Increment number by the amount
  number = (Number.parseInt(number, 10) + step).toString();

  // If there were leading 0s, add them again
  if (leadingZeroes && !number.startsWith("-")) {
    while (number.length < numberLength) {
      number = "0" + number;
    }
  }

  return value.replace(/[0-9]/g, "").concat(number);
}

const createVariable = (name, data) => {

  let url = "POST " + path_();
  url += "/actions/variables";

  if (push_to_org) {
    return octokit.request(url, {
      name: name,
      visibility: visibility,
      value: data
    });
  }

  return octokit.request(url, {
    name: name,
    value: data
  });
};

const setVariable = (name, data) => {

  let url = "PATCH " + path_();
  url += "/actions/variables/" + encodeURIComponent(name);

  return octokit.request(url, {
    name: name,
    value: data
  });
};

const getVariable = (name) => {

  let url = "GET " + path_();
  url += "/actions/variables/" + encodeURIComponent(name);

  return octokit.request(url);
};

const bootstrap = async () => {

  let majorExists = false;
  let minorExists = false;
  let old_minor = "";
  let new_minor = "";
  let old_major = "";
  let new_major = "";

  try {

    try {

      const response = await getVariable("MAJOR");

      majorExists = response.status === 200;
      if (majorExists) old_major = response.data.value;

    } catch (e) {
      if (e.status !== 404) {
        throw e;
      }

      // Variable does not exist
    }

    if (!majorExists) {

      old_major = "1";
      const response = await createVariable("MAJOR", old_major);

      if (response.status !== 201) {
        throw new Error("ERROR: Wrong status was returned: " + response.status);
      }
    }

    try {

      const response = await getVariable("MINOR");

      minorExists = response.status === 200;
      if (minorExists) old_minor = response.data.value;

    } catch (e) {
      if (e.status !== 404) {
        throw e;
      }

      // Variable does not exist
    }

    if (minorExists) {

      if (old_minor === "0" || old_minor === "00") {
        new_minor = "01";
      } else {
        new_minor = increment(old_minor, "1");
      }

      if (new_minor === "100") {
        new_minor = "00";
        new_major = increment(old_major, "1");
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

      new_minor = "00";
      const response = await createVariable("MINOR", new_minor);

      if (response.status === 201) {
        return ("Version set to default value of v" + old_major + "." + new_minor);
      }

      throw new Error("ERROR: Wrong status was returned: " + response.status);
    }

  } catch (e) {
    core.setFailed(path_() + ": " + e.message);
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
    }
  );
