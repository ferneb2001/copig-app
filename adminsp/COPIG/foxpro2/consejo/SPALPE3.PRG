procedure spalpe3
* Notificaciones a profesionales por moratoria    
*  Todos los no habilitados por a¤o de deuda.
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
@04,30 say 'Comunicacion de Moratoria a Profesionales'
*@06,01 say 'Matricula:       Categor¡a:    Nombre:'
*@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
*@10,01 say 'A¤os      :'
*@12,01 say 'Ante:'
*@14,01 say 'Observacion:'
select 1
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
select 6
use sptitu order titulo
wkey=space(7)
wkey1=space(9)
wmatri=0
wcateg=space(2)
wconta=0
select 2
wkey=' 2962B1'
seek(wkey)
do while not eof()
                          *do while wmatri<>99999
                          *   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
                          *   @06,12 get wmatri pict '99999'
                          *   read
   @23,01 clear to 23,78
*   do while numero > 0 and numero < 2000
   if habili > 1985 AND habili < 1988
       wmatri=numero
       @06,10 say numero
       wcateg=catego
       wkey1=str(dctipo,1)+str(dcnro,8)
       select 1
       seek(wkey1)
       if found()
         if estado = '1' or estado = 'A'
            wnota=0
            wcp='    '
            wante=nombre
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
            select 2
            wexptes=space(40)
            if habili = 1991
               wexptes='1992.-'
            else
               wanoin=habili+1
               wexptes=str(wanoin,4)+' a '+'1992.-'
            endif
            wtitul=titulo
            wnomtit=space(30)
            select 6
            seek(wtitul)
            if found()
               wnomtit=titdesc
            else
               wnomtit=space(30)
            endif      
            select 1
*            @10,14 get wexptes
*            read
            wop=1
*            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
*            read
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
                  ?'    Decreto  Ley  N§ 3485/63  -  Ley 5908/92'
                  ?'    Mitre 617  1§ P. - Tel.-Fax (061) 246321'
                  ?'    5500  M E N D O Z A'
                  ??chr(27)+chr(72)
                  ?
                  ?'    NOTA: N§ 401'
                  ?'    CITESE: Expte. N§ 309/P/95'
                  ?
*                  ??chr(27)+chr(71)
*                  ??chr(27)+chr(72)
*                  ??chr(27)+chr(71)
                  ?
                  ?'MENDOZA,' at 37
                  ??day(date()) pict '99' at 46
                  ??' de '    at 48
                  ??wmeses(month(date())) at 52
                  ??' de '    at 61
                  ??year(date()) at 64
                  ?
*                  ??chr(27)+chr(72)
                  ? 
                  ?'    Se¤or:'
                  ??chr(27)+chr(71)
                  ?wnomtit at 4
                  ??wmatri at 50
                  ??wcateg at 62 
                  ?nombre at 4
                  ?domici at 4
                  ?rtrim(wnomloc)+' '+rtrim(wnomdpto) at 4
*                  ??wnomdpto at 19
                  ?wcp at 4
                  ??wnomprov at 11
*                  ??wmatri at 50
                  ??chr(27)+chr(72)
                  ?'    P R E S E N T E:'
                  ?'    ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?'-'
*                  ?
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
                  ?'                             Por  tal  motivo le  comunicamos que, de a-'
*                  ?
                  ?'    cuerdo a  nuestros  registros, adeuda la(s)  matr¡cula(s) correspon-'
*                  ?
                  ?'    diente(s) al/los a¤o(s):'
                  ??chr(27)+chr(71) at 29
                  ??wexptes at 29
                  ??chr(27)+chr(72)
                  ?
                  ?'                             Para evitar problemas derivados del estric-'
 *                 ?
                  ?'    to cumplimiento del Decreto Ley 3485/63 y de la Ley de Desregulaci¢n'
 *                 ?
                  ?'    5908/92,  solicitamos a  Ud., se  acerque  por  nuestra  sede social'
 *                 ?
                  ?'    (Mitre 617 - 1er.Piso - Cdad.) en horario de Lunes a Viernes de 8.30'
 *                 ?
                  ?'    a 12.30 hs., donde se le  informar   ampliamente de las  posibilida-'
 *                 ?
                  ?'    des para regularizar su situaci¢n.-'
                  ?
                  ?'                             En caso  de  no  acogerse a la Moratoria, y'
 *                 ?
                  ?'    vencido el plazo de la misma, las matr¡culas  adeudadas ser n cobra-'
 *                 ?
                  ?'    das por v¡a de apremio.-                                            '
 *                 ?
 *                 ?'    cha fecha el valor es de $ 150,00.-'
                  ?
                  ?'                             Saludamos a Ud. muy atentamente.-'
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?
                  ?'             SERGIO E. GONZALEZ                    DIONISIO DENAZIS    '
                  ?'           Ing. en Construcciones                 Ing. en Electr¢nica  '
                  ?'                 SECRETARIO                           PRESIDENTE       '
                  wcopias=wcopias-2
                  eject
               enddo
              wconta=wconta+1     
              select 7
              use spmoratp
              append blank
              replace nro    with wnota
              replace fecha  with date()
              replace orden  with worden
              replace tipo   with 3
 *             replace expte  with wexpte
              replace matri  with wmatri
              replace categ  with wcateg
              replace exptes with wexptes
 *             replace ante   with wante
 *             replace observac with wobservacion
              *eject
              set printer off
              set device to screen
            endif
          endif    
         else
            @06, 40 say 'No existe'  
         endif
   endif
   select 2
   skip
   @20,60 say wconta
*   if wconta > 0
*      exit
*   endif
*   enddo
*   if wconta > 1
*      exit
*   endif          
enddo
@04,01 clear to 23,78
close all   
close all
return   