from spyne import Application, rpc, ServiceBase, Iterable, Integer, Unicode
from spyne.server.wsgi import WsgiApplication
from spyne.protocol.soap import Soap11
from wsgiref.simple_server import make_server

class TripTimeService(ServiceBase):
    @rpc(Integer, Integer, Integer, _returns=Integer)
    def tripTime(ctx, distance, vitesse, points):
        temps = distance/vitesse * 60
        return temps + (points * 30)

application = Application([TripTimeService], 'spyne.examples.hello.soap',
                            in_protocol=Soap11(validator='lxml'),
                            out_protocol=Soap11())
wsgi_application = WsgiApplication(application)

if __name__ == '__main__':
    server = make_server('127.0.0.1',8080,wsgi_application)
    server.serve_forever()