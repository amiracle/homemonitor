define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'splunk.util',
        'models/config',
        'collections/shared/FlashMessages',
        'models/services/data/inputs/Upload',
        'uri/route',
        'splunk.util',
		'contrib/text!app-js/views/tours/TourFileUpload.html',
		'jquery.fileupload'// jquery.iframe-transport //NO IMPORT
    ],
    function (
        $,
        _,
        module,
        BaseView,
        ControlGroup,
        FlashMessagesView,
        FlashMessagesLegacyView,
        splunkUtil,
        ConfigModel,
        FlashMessagesCollection,
        UploadModel,
        route,
        splunkUtil,
        template
    ) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.maxFileSize = 20*1024*1024;

                this.model.input = new UploadModel();
                this.filename = this.model.tour.entry.content.get(this.options.imageAttrName) || false;
                this.fileData = this.model.tour.entry.content.get(this.options.imageAttr) || false;
                this.imgDest = splunkUtil.make_url(splunkUtil.sprintf('static/app/tour_makr/img/%s', this.model.tour.entry.get('name')));

                this.collection = {};
                // Use this flashmessage for input model
                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                // Use this flashmessages is for front end errors
                this.collection.flashMessages = new FlashMessagesCollection();
                this.children.flashMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.collection.flashMessages
                });
            },

            events: {
                'click .upload-file-button': function(e) {
                    e.preventDefault();
                    this.$('#inputReference').click();
                }
            },

            render: function () {
                //remove any old fileReferences
                this.$('#inputReference').remove();

                var helpLinkUpload = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.upload'
                );

                var helpLinkBrowser = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.browser'
                );

                var template = this.compiledTemplate({
                    inputMode: 0,
                    helpLinkUpload: helpLinkUpload,
                    helpLinkBrowser: helpLinkBrowser,
                    maxFileSize:  Math.floor(this.maxFileSize/1024/1024)
                });
                this.$el.html(template);

                if (this.filename){
                    this.model.input.set('ui.name', this.filename);
                    this.updateSelectedFileLabel();
                    this.updatePreviewBG(this.filename);
                }

                this.$('.shared-flashmessages')
                    .html(this.children.flashMessages.render().el)
                    .append(this.children.flashMessagesLegacy.render().el);

                this.renderUpload.call(this);

                return this;
            },

            renderUpload: function(){
                var that = this;
                var dropzone = this.$('.dropzone');
                var inputReference = this.$('#inputReference');
                var file;
                this.updateSelectedFileLabel();

                inputReference
                    .on('change', function(e){
                        file = e.target.files[0];
                        if (file && that.isInputValid(file)) {
                            that.setImage(file);
                        }
                    });

                dropzone
                    .on('drop', function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        var files = e.originalEvent.dataTransfer.files,
                            file = files[0];

                        // check file amount
                        if (files.length > 1) {
                            that.collection.flashMessages.reset([{
                                key: 'tooManyFiles',
                                type: 'error',
                                html: _('Too many files. Just one, please and thanks.').t()
                            }]);
                            return false;
                        } 

                        if (file && that.isInputValid(file)) {
                            that.setImage(file);
                        }
                    })
                    .on('dragover', function (e) {
                        e.preventDefault();
                    });
            },

            setImage: function(file) {
                this.collection.flashMessages.reset();
                var newFileName = file.name.split(' ').join('_');
                this.model.input.set('ui.name', newFileName);
                this.updateSelectedFileLabel();
                this.updatePreview(file, newFileName);
                this.startUploading(file, newFileName);
            },

            updatePreview: function(file, filename) {
                var that = this,
                    reader = new FileReader();

                this.model.tour.entry.content.set(this.options.imageAttrName,  filename);
                reader.readAsDataURL(file);
            },

            startUploading: function(file, filename) {
                var that = this;

                if (window.FormData) {
                    formdata = new FormData();
                    formdata.append("image", file);
                    formdata.append("filename", filename);
                    formdata.append("tourName", this.model.tour.entry.get('name'));

                    $.ajax({
                        url: "/en-US/custom/tour_makr/upload/",
                        type: "POST",
                        data: formdata,
                        processData: false,
                        contentType: false,
                        success: function (res) {
                            that.updatePreviewBG(filename);
                        },
                        error: function(res){
                            
                        }
                    });
                }
            },

            isInputValid: function(file){
                // check file size
                if (file.size > this.maxFileSize){
                    var maxFileSizeMb = Math.floor(this.maxFileSize/1024/1024),
                        fileSizeMb = file.size/1024/1024,
                        fileSizeMbFixed = fileSizeMb.toFixed(2);

                    this.collection.flashMessages.reset([{
                        key: 'fileTooLarge',
                        type: 'error',
                        html: splunkUtil.sprintf(_('File too large. The file selected is %sMb. Maximum file size is %sMb').t(), fileSizeMbFixed, maxFileSizeMb)
                    }]);
                    return false;
                }

                // check if it's an image
                if (file.type.indexOf('image') == -1) {
                    this.collection.flashMessages.reset([{
                        key: 'notAnImage',
                        type: 'error',
                        html: _('This file is not an image!').t()
                    }]);
                    return false;
                }

                return true;
            },

            resetProgressBar: function(){
                this.finished = false;
                this.updateProgressBar(0, '', false);
                this.$('.progress').hide();
            },

            updateProgressBar: function(progress, text, spin){
                if(progress === 100 && this.finished === false){
                    text = _('Generating data preview...').t();
                    spin = true;
                }
                var $bar = this.$('.progress-bar').css('width', progress+'%');
                $bar.find('.sr-only').html(text);

                if(spin === true){
                    $bar.addClass('progress-striped active');
                }else if(spin === false){
                    $bar.removeClass('progress-striped active');
                }

            },

            updateSelectedFileLabel: function() {
                var filename = this.model.input.get('ui.name');
                if (filename) {
                    this.$('.source-label').text(filename);
                } else {
                    this.$('.source-label').text(_('No file selected').t());
                }
            },

            updatePreviewBG: function(imgName) {
                this.$('.preview-tile').text('').css('background', 'url(' + this.imgDest + '/' + imgName + ')');
            },
        });
    }
);
