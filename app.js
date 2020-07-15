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
const { Doc } = require('./models')


// router
const router = KoaRouter()

// public plain text
router.get('/', ctx => {
    ctx.response.body = 'hello world!'
})

// get query parameters
router.get('/users', ctx => {
    ctx.response.body = 'hello ' + JSON.stringify(ctx.request.query)
})

// path parameters
router.get('/users/:id', ctx => {
    ctx.response.body = `hello to ${ctx.params.id}`
})

// render template
router.get('/view', async ctx => {
    await ctx.render('index', { title: 'hello' })
})

// response json
router.get('/api', ctx => {
    ctx.response.body = { status: true }
})

// backend database (`sequelize ORM`)
router.get('/api/auto-id', async ctx => {
    const new_record = await Doc.create({ body: '{}' })
    ctx.response.body = { id: new_record.id }
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
    ctx.response.body = JSON.stringify(ctx.request.query)
})

router.post('/target', async ctx => {  // request with files
    let request_data = ctx.request.body
    for (let k in ctx.request.files) {
        // noinspection JSUnfilteredForInLoop
        const buffer = await fs.readFile(ctx.request.files[k].path)
        // noinspection JSUnfilteredForInLoop
        request_data[k] = buffer.toString('base64')  // cast binary to base64
    }

    ctx.response.body = request_data
})

// response binary
router.get('/logo', async ctx => {
    const buffer = await fs.readFile(path.join(__dirname, 'public', 'images', 'js-logo.png'))
    ctx.response.type = 'image/png'
    ctx.response.body = buffer
})


app.use(router.routes())

// start server
const PORT = process.env.PORT || 3000
console.log('Server has started and listen to port ' + PORT)
app.listen(PORT)
