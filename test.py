from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def homePage():
    """
    Display landing page for site
    """

    return render_template('test.html')


@app.route('/maps/')
def maps():
    return render_template('maps.html')

if __name__ == '__main__':
    app.secret_key = 'super_duper_extra_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=5000)