procedure spalne2
* Notificaciones a empresas por moratoria    
* Una por Una
set talk off
dimension wmeses(12)
store 'enero' to wmeses(1)
store 'febrero' to wmeses(2)
store 'marzo'   to wmeses(3)
store 'abril'   to wmeses(4)
store 'mayo'    to wmeses(5)
store 'junio'   to wmeses(6)
store 'julio'   to wmeses(7)
store 'agosto'  to wmeses(8)
store 'setiembre' to wmeses(9)
store 'octubre'   to wmeses(10)
store 'noviembre' to wmeses(11)
store 'diciembre' to wmeses(12)
@04,01 clear to 23,78
@04,30 say 'Comunicacion de Moratoria a Empresas'
@06,01 say 'Matricula:       Categor¡a:    Nombre:'
*@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
@10,01 say 'A¤os      :'
*@12,01 say 'Ante:'
*@14,01 say 'Observacion:'
select 1
use spprofe index spprofe
select 2
use spmatrie index spmatrie
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
*select 6
*use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wdate={14/02/96}
wcateg=space(2)
do while wmatri<>99999
   wobservacion=space(65)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if wmatri<>99999
      @06,29 get wcateg pict '!!'
      read
      wkey=str(wmatri,5)+wcateg
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
*         wtitulo=titulo
         select 1
         seek(wkey1)
         if found()
            wnota=0
            wcp='    '
            wexpte=space(10)
            worden=space(12)
            @06,40 say nombre
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               wcp=cpost
            else
               wnomloc=space(15)
            endif
            select 5
            seek(str(a.dpto,3))
            if found()
               wnomdpto=nombre
               if wcp='    '
                  wcp=cpost
               endif   
            else
               wnomdpto=space(15)
            endif
            select 4
            seek(a.provin)
            if found()
               wnomprov=nombre
               if wcp='    '
                  wcp=cpost
               endif   
            else
               wnomprov=space(15)
            endif
 *           select 6
 *           seek(wtitulo)
 *           if found()
 *              wnomtit=titdesc
 *           else
 *              wnomtit=space(15)
 *           endif      
            select 1
  *          @08,10 get wnota pict '99999'
  *          @08,35 get wexpte pict '!!!!!!!!!!'
  *          @08,56 get worden pict 'XXXXXXXXXXXX'
  *          read
            wexptes=space(40)
            wante=space(50)
            @10,14 get wexptes
  *          @12,14 get wante
  *          @14,14 get wobservacion
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               wcopias=2
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               do while wcopias>0
                  ??chr(27)+chr(71)
                  ?'    CONSEJO PROFESIONAL DE'
                  ?'    INGENIEROS, AGRIMENSORES Y GEOLOGOS'
                  ?'    Decreto  Ley  N§ 3485/63  - Ley  5908/92'
                  ?'    Mitre 617  1§ P. - Tel.-Fax (061) 246321'
                  ?'    5500   M E N D O Z A'
                  ??chr(27)+chr(72)
                  ?
                  ?'    NOTA: N§ 401'
                  ?'    CITESE: Expte. N§ 309/P/95'
                  ?
*                  ??chr(27)+chr(71)
*                  ??chr(27)+chr(72)
*                  ??chr(27)+chr(71)
                  ?
                  ?'MENDOZA,' at 31
                  ??day(wdate) pict '99' at 41
                  ??' de '    at 44
                  ??wmeses(month(wdate)) at 48
                  ??' de '    at 58
                  ??year(wdate) at 62
                  ?
*                  ??chr(27)+chr(72)
                  ? 
                  ?'    Se¤or(es):'
                  ??chr(27)+chr(71)
*                  ?wnomtit  
                  ?nombre at 4
                  ?domici at 4
                  ?wnomloc at 4
                  ?wnomdpto at 4
                  ?wcp at 4
                  ??wnomprov at 11
                  ??chr(27)+chr(72)
                  ?'    P R E S E N T E:'
                  ?'    ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?'-'
                  ?
                  ?
                  ?'                             El CONSEJO PROFESIONAL DE INGENIEROS, AGRI-'
*                  ?
                  ?'    MENSORES Y GEOLOGOS DE MENDOZA, ha implementado por Resoluci¢n N§ 63'
*                  ?
                  ?'    /95, una MORATORIA GENERAL desde el 1-12-95 al 29-2-96 de aplicaci¢n'
*                  ?
                  ?'    al pago de las Inscripciones anuales en  mora de Profesionales y Em-'
*                  ?
                  ?'    presas inscriptos en los Registros Oficiales de este Consejo.'
                  ?
                  ?'                             Por tal motivo le(s) comunicamos que, de a-'
*                  ?
                  ?'    cuerdo a  nuestros  registros, adeuda(n) la(s)  matr¡cula(s) corres-'
*                  ?
                  ?'    pondiente(s) al/los a¤o(s):'
                  ??chr(27)+chr(71) at 32
                  ??wexptes at 32
                  ??chr(27)+chr(72)
                  ?
                  ?'                             Para evitar problemas derivados del estric-'
 *                 ?
                  ?'    to cumplimiento del Decreto Ley 3485/63 y de la Ley de Desregulaci¢n'
 *                 ?
                  ?'    5908/92,  solicitamos a  Ud(es)., se  acerque(n)  por  nuestra  sede'
 *                 ?
                  ?'    (Mitre 617 - 1er.Piso - Cdad.) en horario de Lunes a Viernes de 8.30'
 *                 ?
                  ?'    a 12.30 hs., donde se le(s) informar   ampliamente de las  posibili-'
 *                 ?
                  ?'    dades para regularizar su/vuestra situaci¢n.-'
                  ?
                  ?'                             Adem s le(s) informamos que se encuentra al'
 *                 ?
                  ?'    cobro la Matr¡cula correspondiente al a¤o 1996, cuyo valor fue fija-'
 *                 ?
                  ?'    do en $ 120,00 si fuera abonado antes del 31-12-95, a  partir de di-'
 *                 ?
                  ?'    cha fecha el valor es de $ 150,00.-'
                  ?
                  ?'                             Saludamos a Ud(es). muy atentamente.-'
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'                 SERGIO E. GONZALEZ                  DIONISIO DENAZIS   '
                  ?'               Ing. en Construcciones               Ing. en Electr¢nica '
                  ?'                     SECRETARIO                         PRESIDENTE      '
                  wcopias=wcopias-2
                  eject
               enddo    
*              select 7
*              use spmorat
*              append blank
 *             replace nro    with wnota
       *       replace fecha  with date()
 *             replace orden  with worden
       *       replace tipo   with 2
 *             replace expte  with wexpte
       *       replace matri  with wmatri
       *       replace categ  with wcateg
       *       replace exptes with wexptes
 *             replace ante   with wante
 *             replace observac with wobservacion
              *eject
              set printer off
              set device to screen
            endif  
         else
            @06, 40 say 'No existe'  
         endif
      endif    
   endif    
enddo
@04,01 clear to 23,78
close all   
close all
   