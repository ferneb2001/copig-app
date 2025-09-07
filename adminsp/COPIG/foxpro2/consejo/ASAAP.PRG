procedure asaap
* Actualizacion archivo de asociados
wsigue='S'
contii='s'
wnumero=0
set exclusive off
*set multilocks on
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
select 5
use splocal order cod
select 6
use spdpto order dpto
select 7
use spprov order prov
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DE ASOCIADOS'
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
      use spmatri index spmatri
      seek(wkey)
      if found()
         wqtitulo=titulo
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         use spprof index spprof, spprofn
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
*             do while wop<>1
                @23,25 get wop picture '@*H \<Salir;\<Ingresar como asociado';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
*                else
*                   if wop=3
*                      save screen to pant1
*                      do otros
*                      restore screen from pant1
*                      wop=3
*                   endif
                endif         
                @23,01 clear to 23,78
*             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         @06,60 say 'No encontro'
 *        DO INGRESOS with wnumero, wcatego
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
wotro=0
@15,40 to 23,78
save screen to pant1
     do persoaso
restore screen from pant1
return

procedure persoaso
do pant001
wasocia=0
wsenal=0
@23,01 clear to 23,78
@07,17 get wasocia pict '999999'
read
select 4
use spasocia order asociado
seek(wasocia)
if found()
	@08,17 say asnombre
	@07,51 say astipo
	@07,58 say asnro
	@10,17 say asdomp
	@11,17 say aslocp pict '999'
	select 5
	seek(d.aslocp)
	if found()
		@11,23 say nombre
	endif
	select 4
	@12,17 say asdptp pict '999'
	select 6
	seek(d.asdptp)
	if found()
		@12,23 say nombre
	endif
	select 4
	@13,17 say aspcip pict '999'
	select 7
	seek(d.aspcip)
	if found()
		@13,23 say nombre
	endif
	select 4
	@11,52 say astelp
	@12,52 say ascelp
	@13,52 say asemaip
	@15,17 say asdoml
	@16,17 say aslocl pict '999'
	select 5
	seek(d.aslocl)
	if found()
		@16,23 say nombre
	endif
	select 4
	@17,17 say asdptl pict '999'
	select 6
	seek(d.asdptl)
	if found()
		@17,23 say nombre
	endif
	select 4
	@18,17 say aspcil pict '999'
	select 7
	seek(d.aspcip)
	if found()
		@18,23 say nombre
	endif
	select 4
	@16,52 say astell
	@17,52 say ascell
	@18,52 say asemail
	@19,17 say b.numero
	@19,36 say b.catego
	@20,17 say wtitdesc
	@21,17 say asfeing
	wsenal=1
	@23,20 say 'Asociado ya ingresado '
	@23,77 get wsenal pict '9'
	read
else
	wnombre=a.nombre
	wdctipo=a.dctipo
	wdcnro=a.dcnro
	wdomici=a.domici
	wlocp=a.locali
	wdptp=a.dpto
	wpciap=a.provin
	wtelef=a.telef
	wcelp=space(15)
	wemailp=space(30)
	wdomicl=space(44)
	wlocl=0
	wdptol=0
	wpcial=0
	wtelel=space(15)
	wcell=space(15)
	wemaill=space(30)
	wfechin=date()
	wfebaj={  /  /    }
	wfehabi={  /  /    }
	@08,17 say wnombre
	@07,51 say wdctipo pict '9'
	@07,58 say wdcnro  pict '99999999'
	@10,17 say wdomici
	@11,17 say wlocp pict '999'
	select 5
	seek(wlocp)
	if found()
		@11,23 say nombre
	endif
	select 4
	@12,17 say wdptp pict '999'
	select 6
	seek(wdptp)
	if found()
		@12,23 say nombre
	endif
	select 4
	@13,17 say wpciap pict '999'
	select 7
	seek(wpciap)
	if found()
		@13,23 say nombre
	endif
	select 4
	@11,52 say wtelef
	@12,52 say wcelp
	@13,52 say wemailp
	@15,17 say wdomicl
	@16,17 say wlocl pict '999'
	select 5
	seek(wlocl)
	if found()
		@16,23 say nombre
	endif
	select 4
	@17,17 say wdptol pict '999'
	select 6
	seek(wdptol)
	if found()
		@17,23 say nombre
	endif
	select 4
	@18,17 say wpcial pict '999'
	select 7
	seek(wpcial)
	if found()
		@18,23 say nombre
	endif
	select 4
	@16,52 say wtelel
	@17,52 say wcell
	@18,52 say wemaill
	@19,17 say b.numero
	@19,36 say b.catego
	@20,17 say wtitdesc
	@21,17 say wfechin
	@10,17 get wdomici
	@11,17 get wlocp pict '999'
	read
	if wlocp<>a.locali
		select 5
		define window plocal from 08,49 to 22,78 title 'Localidades'
		activate window plocal
		brow fields cod, nombre nomodify in window plocal
		deactivate window plocal
		wlocp=cod
		wnomlocali=nombre
		@23,01 clear to 23,78
		@11,17 say wlocp pict '999'
		@11,23 say wnomlocali
		select 4
	endif
	@12,17 get wdptp pict '999'
	read
	if wdptp<>a.dpto
		select 6
		define window plocal from 08,49 to 22,78 title 'Departamentos'
		activate window plocal
		brow fields dpto, nombre nomodify in window plocal
		deactivate window plocal
		wdptp=dpto
		wnomdpto=nombre
		@23,01 clear to 23,78
		@12,17 say wdptp pict '999'
		@12,23 say wnomdpto
		select 4
	endif
	@13,17 get wpciap pict '999'
	read
	if wpciap<>a.provin
		select 7
		define window plocal from 08,49 to 22,78 title 'Provincias'
		activate window plocal
		brow fields prov, nombre nomodify in window plocal
		deactivate window plocal
		wpciap=prov
		wnompcia=nombre
		@23,01 clear to 23,78
		@13,17 say wpciap pict '999'
		@13,23 say wnompcia
		select 4
	endif
	@11,52 get wtelef
	@12,52 get wcelp
	@13,52 get wemailp
	@15,17 get wdomicl
	@16,17 get wlocl pict '999'
	read
	if wlocl<>a.locali
		select 5
		define window plocal from 08,49 to 22,78 title 'Localidades'
		activate window plocal
		brow fields cod, nombre nomodify in window plocal
		deactivate window plocal
		wlocl=cod
		wnomlocali=nombre
		@23,01 clear to 23,78
		@16,17 say wlocl pict '999'
		@16,23 say wnomlocali
		select 4
	endif
	@17,17 get wdptol pict '999'
	read
	if wdptol<>a.dpto
		select 6
		define window plocal from 08,49 to 22,78 title 'Departamentos'
		activate window plocal
		brow fields dpto, nombre nomodify in window plocal
		deactivate window plocal
		wdptl=dpto
		wnomdpto=nombre
		@23,01 clear to 23,78
		@17,17 say wdptol pict '999'
		@17,23 say wnomdpto
		select 4
	endif
	@18,17 get wpcial pict '999'
	read
	if wpcial<>a.provin
		select 7
		define window plocal from 08,49 to 22,78 title 'Provincias'
		activate window plocal
		brow fields prov, nombre nomodify in window plocal
		deactivate window plocal
		wpcial=prov
		wnompcia=nombre
		@23,01 clear to 23,78
		@18,17 say wpcial pict '999'
		@18,23 say wnompcia
		select 4
	endif
	@16,52 get wtelel
	@17,52 get wcell
	@18,52 get wemaill
	@21,17 get wfechin
	read
	wsenal=0
	append blank
	replace asociado with wasocia
	replace astipo  with wdctipo
	replace asnombre with wnombre
	replace asnro    with wdcnro
	replace asdomp   with wdomici
	replace aslocp   with wlocp
	replace asdptp   with wdptp
	replace aspcip   with wpciap
	replace astelp   with wtelef
	replace ascelp   with wcelp
	replace asemaip  with wemailp
	replace asdoml   with wdomicl
	replace aslocl   with wlocl
	replace asdptl   with wdptol
	replace aspcil   with wpcial
	replace astell   with wtelel
	replace ascell   with wcell
	replace asemail  with wemaill
	replace asfeing  with wfechin
	replace asfbaja  with wfebaj
	replace asfhabi  with wfehabi
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
@09,02 clear to 13,78
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
  endif   
     wxnume = wnumero
     wxcate = wcatego
     wxdcti= a.dctipo
     wxdcnro= a.dcnro
     wxtitu=space(3)
     wxotorga=0
     wxfecti={  /  /  }
     wxfecce={  /  /  }
     WOPT1=1
     select 9
	 @23,01 clear to 23,78
	 @23,15 get wopt1 pict '@*H \<Contin£a;\<Elimina t¡tulo;\<Modifica' size 1,1
	 read
	 @23,01 clear to 23,78
	 if wopt1 = 1
	    wconti ='s'
	 else
	 	if wopt1 = 2
	 		delete
	 	else
	 		if wopt1 = 3
		      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
      		  @wltiax,17 get wxtitu
     		  read
     		  @23,01 clear to 23,78
     		  if lastkey()<>27
     		    @23,01 say 'Ingrese fecha del titulo  '
         		@wltiax,52 get wxfecti
         		read
         		@23,01 say 'Ingrese fecha certificado '
         		@wltiax,61 get wxfecce
         		read
         		@23,01 say 'Ingresa entidad otorgante '
         		@wltiax,70 get wxotorga pict '999'
*         		wltiax=wltiax+1
         		read
         		select 9
*         		append blank
         		replace axnume  with  wxnume
         		replace axcate  with  wxcate
         		replace axdcti  with  wxdcti
         		replace axdcnro with  wxdcnro
         		replace axtitu  with wxtitu
         		replace axfecti with wxfecti
         		replace axfecce with wxfecce
         		replace axotorg with wxotorga
         	  endif	
	 		endif
	 	endif
	 endif   
*  else
*     @wltiax,21 say '                        '
*  endif
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
      wxotorga=0
      wxfecti={  /  /  }
      wxfecce={  /  /  }
      @23,01 say 'Ingrese codigo de titulo o <esc> para salir'
      @wltiax,17 get wxtitu
      read
      @23,01 clear to 23,78
      if lastkey()<>27
         @wltiax,52 get wxfecti
         @wltiax,61 get wxfecce
         @wltiax,70 get wxotorga pict '999'
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