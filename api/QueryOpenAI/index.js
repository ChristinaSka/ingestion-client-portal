module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const prompt = (req.query.prompt || (req.body && req.body.prompt));

    const api_key = process.env.API_KEY;
    const base_url =  process.env.AOAI_ENDPOINT;
    const deployment_name = process.env.DEPLOYMENT_NAME;
    const url = base_url + "/openai/deployments/" + deployment_name + "/completions?api-version=2022-12-01";

    try {
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": api_key,
            Accept: "application/json",
        },
        body: JSON.stringify({
            "temperature": 0,
            "max_tokens":600,
            "prompt" : prompt,
            })
        })

        const result = await response.json()
        const text = result.choices[0].text
        context.res.json({
            text: text
        });

    } catch (error) {
        context.res.json({
            error: error.toString()
        });
    }
}
