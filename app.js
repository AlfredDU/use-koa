/** simple web server */
// imports
const path = require('path')
const fs = require('fs-extra')
require('handlebars-helpers')()  // additional hbs helpers
const Koa = require('koa')
const KoaBody = require('koa-body')
const KoaJson = require('koa-json')
const KoaRouter = require('koa-router')
const KoaViews = require('koa-views')
const KoaStaticServe = require('koa-static')
const level = require('level')


// web application
const app = new Koa()

// middleware
app.use(KoaBody({ multipart: true }))  // form request
app.use(KoaJson())  // json response
app.use(KoaViews(path.join(__dirname, 'templates'), {  // template engine
    map: { hbs: 'handlebars' },
    extension: 'hbs'
}))
app.use(KoaStaticServe(path.join(__dirname, 'public')))  // public files

// database
const db = level(path.join(__dirname, 'db'))


// router
const router = KoaRouter()

// public plain text
router.get('/', ctx => {
    ctx.body = 'hello world!'
})

// get query parameters
router.get('/users', ctx => {
    ctx.body = 'hello ' + JSON.stringify(ctx.query)
})

// path parameters
router.get('/users/:id', ctx => {
    ctx.body = `hello to ${ctx.params.id}`
})

// render template
router.get('/view', async ctx => {
    await ctx.render('index', { title: 'hello' })
})

// response json
router.get('/api', ctx => {
    ctx.body = { status: true }
})

// backend database (leveldb)
router.get('/api/auto-id', async ctx => {
    let _id
    try {
        _id = await db.get('auto-id', {valueEncoding: 'json'})
    } catch (err) {
        console.error(err)
        _id = 0
        await db.put('auto-id', _id, {valueEncoding: 'json'})
    }

    ctx.body = { id: _id }
    await db.put('auto-id', _id + 1, {valueEncoding: 'json'})
})

// redirect
router.get('/redirect', ctx => {
    ctx.redirect('/form')
})

// form
router.get('/form/:method', async ctx => {
    await ctx.render('form', { method: ctx.params.method })
})


// parse request
router.get('/target', ctx => {
    ctx.body = JSON.stringify(ctx.query)
})

router.post('/target', async ctx => {  // request with files
    let request_data = ctx.request.body
    for (let k in ctx.request.files) {
        // noinspection JSUnfilteredForInLoop
        const buffer = await fs.readFile(ctx.request.files[k].path)
        // noinspection JSUnfilteredForInLoop
        request_data[k] = buffer.toString('base64')  // cast binary to base64
    }

    ctx.body = request_data
})

// response binary
router.get('/logo', async ctx => {
    const buffer = await fs.readFile(path.join(__dirname, 'public', 'images', 'js-logo.png'))
    ctx.type = 'image/png'
    ctx.body = buffer
})


app.use(router.routes())

// start server
const PORT = process.env.PORT || 3000
console.log('Server has started and listen to port ' + PORT)
app.listen(PORT)
