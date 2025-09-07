procedure spalee3k
* Notificaciones a empresas avisando esta al cobro  matr. 2002
*  Todas las no habilitadas por a¤o de deuda un a¤o.
*  25/03/2002
*  texto ampliatorio de la spalee3e
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
@04,30 say 'Comunicacion de Deuda a Empresas'
*@06,01 say 'Matricula:       Categor¡a:    Nombre:'
*@08,01 say 'Nota N§:         Citese Expte N§:            Orden N§:'
*@10,01 say 'A¤os      :'
*@12,01 say 'Ante:'
*@14,01 say 'Observacion:'
select 1
use spprofe index spprofe.idx
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
wcateg=space(2)
wconta=0
wopc=0
select 2
*wkey='       '
*seek(wkey)
do while not eof()
                          *do while wmatri<>99999
                          *   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
      
                          *   @06,12 get wmatri pict '99999'
                          *   read
   @23,01 clear to 23,78
*   do while numero >= 2254
    if numero >= 2254 
    @15,1 say numero
	@15,10 say habili
    if habili = 2001 
*	 if numero= 143
       wmatri=numero
       @06,10 say numero
       wcateg=catego
       wkey1=str(dctipo,1)+str(dcnro,8)
       select 1
       seek(wkey1)
       if found()
         if estado = '1' or estado = 'A'
            wnota=0
            wcp=space(4)
            IF a.emcpost <> 0 
           		 wcp=str(a.emcpost,4)
            endif
            wante=nombre
            wexpte=space(10)
            worden=space(12)
            @06,40 say nombre
            @07,40 say wcp
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               if wcp='    '
               	wcp=cpost
               endif	
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
            @07,46 say wcp
            select 2
            wexptes=space(40)
            if habili = 2000
               wexptes='2001.-'
            else
               wanoin=habili+1
               wexptes=str(wanoin,4)+' a '+'2000.-'
            endif
            wpesos=space(65)
            if habili = 1999
            	wpesos='Trescientos cincuenta  ($ 350.- ) -------------------------------' 
            else
            	wpesos='                                                                 ' 
            endif
            wtitul=titulo
            wnomtit=space(30)
            select 1
*            @10,14 get wexptes
*            read
            wop=1
*            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1
*            read
            @23,01 clear to 23,78
            if wop=1
               wcopias=1
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               do while wcopias>0
                  ??chr(27)+chr(71)
                  ?'    CONSEJO   PROFESIONAL  DE  INGENIEROS  Y'
                  ?'                    GEOLOGOS'
                  ?'    Dto. Ley N§ 3485/63 - Dto.1041/65 - Ley 5908 - Dto.638/97 - Ley 6936'
                  ?
                  ?'    Mitre 617 - Planta Baja       '
                  ?'    5500 - Capital - M E N D O Z A'
                  ?'    Tel./Fax: 0261 - 4239178 ¢ 4231274'
                  ?'    E-mail  : ingenieros@copigmza.org.ar '
                  ??chr(27)+chr(72)
                  ?
                  ?
                  ?'                              '
                  ?
                  ?'     Se¤or/es:'
                  ??chr(27)+chr(71)
                  ?nombre at 5
                  ?'Matr¡cula: ' at 5
                  ??wmatri at 27
*                  ??wcateg at 62 
*				  ?'     At.Ing.JORGE EDUARD TERRERA  (4311-A) ' 
                  ?domici at 5
                  ?rtrim(wnomloc)+' '+rtrim(wnomdpto) at 5
                  ?wcp at 5
                  ??wnomprov at 16
                  ??chr(27)+chr(72)
                  ?'     ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ'
                  ?
                  ?
                  ?chr(27)+chr(71) 
                 ??chr(27)+chr(69)
*                 ??'                         Ref.: Reiteraci¢n nota y pr¢rroga de plazo para'
*                  ?'                               cancelaci¢n de matr¡cula                 '
                 ??'                        '
                 ??chr(27)+chr(45)+chr(49)
                 ??'Ref.: Reiteraci¢n nota y pr¢rroga de plazo para'
                 ??chr(27)+chr(45)+chr(48)
                  ?'                              '
                 ??chr(27)+chr(45)+chr(49)
                 ??'cancelaci¢n de matr¡cula'
                 ??chr(27)+chr(45)+chr(48)
                 ??'                  '
                 ??chr(27)+chr(72) 
                 ??chr(27)+chr(70)
				  ?
                  ?' '
                  ?'MENDOZA,' at 37
                  ??day(date()) pict '99' at 46
                  ??' de '    at 48
                  ??wmeses(month(date())) at 52
                  ??' de '    at 61
                  ??year(date()) at 64
                  ?
                  ?'    De nuestra mayor consideraci¢n:                                     '
                  ?
                  ?'                    Tenemos el agrado de  dirigirnos a  Ud(es). a fin de'
                  ?'    notificarle(s) que  de acuerdo al Art. 5ø del Decreto  Reglamentario'
                  ?'    1041/65:  "..., los profesionales, empresas y entidades  deber n ma-'
                  ?'    tricularse en los Registros respectivos. '
                 ??chr(27)+chr(71)
                 ??chr(27)+chr(69)
                ??'Anualmente  deber n renovar'
*                ??'                                             Anualmente  deber n renovar'
                  ?'    la inscripci¢n durante los meses de Octubre y Noviembre.'
                 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
                 ??'..". Asimis-'
                  ?'    mo, por la presente, le(s) comunicamos que por Resoluci¢n  Nø 236/01'
				  ?'    el importe de la '
				 ??chr(27)+chr(71)                                
                 ??chr(27)+chr(69)
				 ??'matr¡cula '
				 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
				 ??'correspondiente al '
				 ??chr(27)+chr(71)
                 ??chr(27)+chr(69)
				 ??'a¤o 2002 '
				 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
				 ??'asciende a la'                               
                  ?'    suma de pesos'
                 ??chr(27)+chr(71)
                 ??chr(27)+chr(69) 
                  ??' TRESCIENTOS '
*                 ??chr(27)+chr(71)
*                 ??chr(27)+chr(69)
                 ??'($ 300,00) '
*                 ??chr(27)+chr(72)
*                 ??chr(27)+chr(70) 
                 ??'para  empresas locales'
                 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
                 ??' y de pe-' 
				  ?'    sos SEISCIENTOS '
				 ??chr(27)+chr(71) 
                 ??chr(27)+chr(69)
				 ??'($ 600,00) '
				 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
				 ??'para empresas con  domicilio fuera  de la'
                  ?'    provincia.-                                                         '
                  ?
                  ?chr(27)+chr(71) 
                 ??chr(27)+chr(69)
                 ??'                    En  virtud  de  la  situaci¢n  econ¢mica reinante en'
                  ?'    nuestro pa¡s y particularmente en la provincia de Mendoza, le(s) co-'
                  ?'    municamos que ha sido prorrogado este plazo de cancelaci¢n en t‚rmi-'
                  ?'    no de la matr¡cula anual hasta el d¡a 30 de Abril de 2002 y la mis- '
                  ?'    ma puede ser abonada en tres (3) pagos iguales y consecutivos.-     '
                 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
                  ?
                  ?'                    De acuerdo al Art.7ø del Decreto Reglamentario 1041/'
                  ?'    65 la falta de reinscripci¢n anual produce  autom ticamente la inha-'
                  ?'    bilitaci¢n de la empresa y s¢lo podr  ser rehabilitada  por decisi¢n'
                  ?'    del  Consejo  previo  pago de los  recargos por mora, salvo  caso de'
                  ?'    fuerza mayor.-                                                      '
                  ?
                  ?chr(27)+chr(71) 
                 ??chr(27)+chr(69)
                 ??'                    En el caso de cese de  actividades de la Empresa, se'
                  ?'    debe comunicar fehacientemente a este Consejo dicha situaci¢n,'
                 ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
                 ??' acom-'
                  ?'    pa¤ando la  documentaci¢n  probatoria de  haber sido dada de baja en'
                  ?'    las reparticiones correspondientes. '
                  ??chr(27)+chr(71)
                 ??chr(27)+chr(69)
                  ??'Caso  contrario ser  considerada'
                  ?'    en ejercicio activo '
                  ??chr(27)+chr(72)
                 ??chr(27)+chr(70) 
                  ??'(Art 6ø del Decreto Reglamentario 1041/65).-    '
                  ?
                  ?'                   Sin otro particular, saludamos a Ud(es) atentamente.-'
                  ?
                  ?
                  ?
                  ?
                  ?'                RAUL H. DELLE DONNE            SERGIO E. GONZALEZ    '
                  ?'              Ing. en Construcciones         Ing. en Construcciones  '
                  ?'                    SECRETARIO                     PRESIDENTE        '
                  wcopias=wcopias-1
                  eject
               enddo
              wconta=wconta+1     
              select 7
              use spmoratp
              append blank
              replace nro    with wnota
              replace fecha  with date()
              replace orden  with worden
              replace tipo   with 1
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
return  
 