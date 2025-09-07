procedure spaap2
* Actualizacion archivo de profesionales de otras ramas no incluidas en el Consejo
wsigue='S'
contii='s'
wnumero=0
set exclusive off
wcatego=space(2)
wnom=space(30)
westado=space(15)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wcurso=0
wkey=space(7)
@04,01 clear to 23,78
@04,15 say 'ACTUALIZACION DE PROFESIONALES DE OTRAS RAMAS'
do while contii='s'
do while wsigue='S'
   @05,01 clear to 23,78
   @06,02 say 'Matricula'
   @06,20 say 'Categ.:'
   do panta01
   wnumero=0
   @23,01 say 'Indique el nro.de matricula, <F1> para obtener ayuda o <ESC> para salir'
   @06,13 get wnumero pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>28
   if lastkey()<> 27
      @23,01 say 'Indique la categoria'
      @06,28 get wcatego pict '!!'
      read
      wxcat= 0
*      do contrcat
      if wxcat = 0
      wkey=str(wnumero,5)+wcatego
      select 2
      use somatri index somatri.idx, somatdo 
      seek(wkey)
      if found()
         wqtitulo=titulo
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         use soprof index soprof.idx, soprofn
         seek(wkey1)
         if found()
            do panta01
            @06,31 say nombre
            do case
               case b.condic='1'
                    westado= 'Activo'
               case b.condic='2'
                    westado='Carnet Dep.'
               case b.condic='3'
                    westado= 'Fallecido'
               case b.condic='4'
                    westado= 'Suspendido'
               case b.condic='5'
               	    westado= 'Baja de Matr¡cula'
               case b.condic='6'
                    westado= 'Comunica Inactividad'	         
               case b.condic=' '
                    westado= '                 '
            endcase
            @21,02 say 'Estado      : '
            @21,21 say westado            
*  se relaciona matri con titu para poner descrip.del titulo
             select 3
             use sptitu order titulo
             select 2
             set relation to titulo into sptitu            
             wtitdesc=c.titdesc
             wotorga=b.otorga
             @08,17 say c.titulo
             @08,21 say c.titdesc
             @09,16 say b.otorga
             @14,17 say b.inscr
             @15,17 say b.fectit
             @16,17 say b.fechab
             @17,17 say b.pago
             @18,17 say b.habili
             @19,17 say b.feccert
             if b.fectit <> {  /  /  }
                @20,17 say 'definitiva'
             else
                @20,17 say 'provisoria'
             endif
             select 3
             use spente order codigo
             seek(b.otorga)
             if found()
                wnoment=nombre
             else
                wnoment=space(15)
             endif
             @09,21 say wnoment 
*             do spotti
             wop=2
             do while wop<>1
                @23,25 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
                else
                   if wop=3
                      save screen to pant1
                      do otros
                      restore screen from pant1
                      wop=3
                   endif
                endif         
                @23,01 clear to 23,78
             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         *@06,60 say 'No encontro'
         DO INGRESOO with wnumero, wcatego
      endif
      else
         @23, 01 say 'Mal codigo de categoria '
      endif   
   else
      wsigue='N'
   endif
   else
      save screen to wscr01
      do spay01
      restore screen from wscr01
   endif
   close all   
enddo
wop=2
@23,25 get wop pict '@*H \<Salir;\<Continuar ' size 1,1
read
@23,01 clear to 23,78
if wop=1
   contii='n'
else
   wsigue='S'   
endif
enddo
close all
@04,01 clear to 23,78
return


procedure modifica1
wnom=a.nombre
wtit=b.titulo
wfincr=b.inscr
wftit=b.fectit
wfhabil=b.fechab
wpago=b.pago
wfecb=b.habili
wfeccert=b.feccert
westcon=b.condic
@06,31 get wnom
@08,17 get wtit
read
if wtit<>b.titulo   
   @14,50 clear to 14,59
   select 3
   use sptitu order titdesc
   @23,01 say 'Seleccione un titulo y oprima <ESC> '
   define window ptit from 13,30 to 20,63 title 'Titulos'
   activate window ptit
   brow fields titdesc nomodify in window ptit
   deactivate window ptit
   @23,01 clear to 23,78
   wtit=titulo
   wtitdesc=titdesc
endif
wopent=1
@23,20 say 'Indique 1=Universidades 2=esc.Tecnicas 3=Municipalid.'
@09,10 get wopent pict '9'
read
wotorga=b.otorga
wnoment=space(25)
select 3
use spente order codigo
if wotorga<>'    '
   seek(wotorga)
   if found()
      wnoment=nombre
   else
      wnoment=space(25)
   endif
endif          
@23,01 say 'Seleccione una Entidad y oprima <ESC> '
define window pent from 10,30 to 22,77 title 'Entidad Educativa'
activate window pent
if wopent = 1
   brow fields codigo, nombre, univer nomodify in window pent for univer = 1
else
   if wopent = 2
      brow fields codigo, nombre, univer nomodify in window pent for univer = 2
   else
      brow fields codigo, nombre, univer nomodify in window pent for univer = 3
   endif
endif            
deactivate window pent
@23,01 clear to 23,78
if codigo <>'    '
   wotorga=codigo
   wnoment=nombre
else
*   wopent1=1
*   @23,01 clear to 23,78
*   @23,01 say 'Seleccione una Entidad y oprima <ESC> '
*   wotorga=codigo
*   wnoment=space(25)   
endif   
@08,17 say wtit pict 'XXX'
@08,21 say wtitdesc
@09,16 say wotorga
@09,21 say wnoment
@14,17 get wfincr
@15,17 get wftit
@16,17 get wfhabil
@17,17 get wpago
@18,17 get wfecb
@19,17 get wfeccert
@21,17 get westcon
*wcurso=0
*@22,16 get wcurso
read
select 1
replace nombre  with wnom
*replace estado  with westcon
select 2
replace b.titulo  with wtit
replace b.inscr   with wfincr
replace b.fectit  with wftit
replace b.fechab  with wfhabil
replace b.pago    with wpago
replace b.habili  with wfecb
replace b.feccert with wfeccert
replace b.otorga  with wotorga
if westcon = '1' 
   westado= 'Activo '
   replace b.condic with '1'
else
   if westcon = '5'
      westado = 'Baja '
      replace b.condic with '5'
   else
      if westcon = '2'
         westado = 'Carnet depositado'
         replace b.condic with '2'
      else
         if westcon='3'
            westado = 'Fallecido '
            replace b.condic with '3'
         else
            if westcon='4'
               westado= 'Suspendido'
               replace b.condic with '4'
            else
               if westcon='6'
                  westado='Comunica Inactividad'
                  replace b.condic with '6'
               else   
                  if westcon=' '
                     westado='          '
                     replace b.condic with '0'
                  endif   
               endif      
            endif
         endif
      endif
   endif
endif
@21,21 say westado                           
@23,01 clear to 23,78
return

procedure otros
wotro=0
@15,40 to 23,78
@16,40 say 'Otros datos'
@16,55 get wotro picture '@* \<Datos Personales;\<Observ;\<Salir';
                          size 1,1
read
@16,40 clear to 23,78
do case
   case wotro = 1
      do personao with wkey
   case wotro = 2
*      do pagos with wkey
*   case wotro = 3
*      do buscasan with wnumero, wcatego
*   case wotro = 4
*      do cursos with wkey
*   case wotro = 5
*      do spotti1
*   case wotro = 6
      do spobser with wkey, wkey1    
endcase   
return

procedure contrcat
if wcatego = 'A '
	wxcat=0
else
   if wcatego = 'B1'
      wxcat=0
   else
      if wcatego = 'B2'
         wxcat = 0
      else
         if wcatego = 'C '
            wxcat = 0
         else
            if wcatego = 'D '
               wxcat = 0
            else
               if wcatego = 'E '
                  wxcat = 0
               else
                  if wcatego = 'CA'
                     wxcat = 0
                  else
                     if wcatego = 'CR'
                        wxcat = 0
                     else      
                        wxcat = 1
                     endif   
                  endif   
               endif
            endif
         endif
      endif
   endif
endif                                 	
return

procedure spotti
wltiax=10
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,17 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,21 say titdesc
  else
     @wltiax,21 say '                        '
  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
return

procedure spotti1
wltiax=10
select 9
use sptiaux index sptiaux
locate for wkey = str(axnume,5)+axcate
do while found()
  @wltiax,17 say axtitu
  select 3
  use sptitu order titulo
  seek(i.axtitu)
  if found()
     @wltiax,21 say titdesc
  else
     @wltiax,21 say '                        '
  endif
  wltiax=wltiax+1
  select 9
  continue
enddo
WOPT1=1
@23,01 clear to 23,78
@23,15 get wopt1 pict '@*H \<Salir;\<Ingresar' size 1,1
read
@23,01 clear to 23,78
if wopt1 = 2
   wconti ='s'
   do while wconti='s'
      wxnume = wnumero
      wxcate = wcatego
      wxdcti= a.dctipo
      wxdcnro= a.dcnro
      wxtitu=space(3)
      wxotorga=space(4)
      wxfecti={  /  /  }
      wxfecce={  /  /  }
      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
      @wltiax,17 get wxtitu
      read
      @23,01 clear to 23,78
      if lastkey()<>27
         @wltiax,52 get wxfecti
         @wltiax,61 get wxfecce
         @wltiax,70 get wxotorga pict 'XXXX'
         wltiax=wltiax+1
         read
         select 9
         append blank
         replace axnume  with  wxnume
         replace axcate  with  wxcate
         replace axdcti  with  wxdcti
         replace axdcnro with  wxdcnro
         replace axtitu  with wxtitu
         replace axfecti with wxfecti
         replace axfecce with wxfecce
         replace axotorg with wxotorga
      else
         wconti='n'
      endif
   enddo   
endif
return